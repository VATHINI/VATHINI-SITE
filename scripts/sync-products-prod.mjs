import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const EXPECTED_PROD_DB = 'a7d8eaa4-d10b-4b00-923e-46a294fefc8e';
const {
  CLOUDFLARE_API_TOKEN_PROD: token,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_D1_DATABASE_ID_PROD: databaseId
} = process.env;
if (!token || !/^[a-f0-9]{32}$/i.test(accountId ?? '') || databaseId !== EXPECTED_PROD_DB) {
throw new Error('Configuration GitHub de production absente ou identifiant D1 de production incorrect. Aucune écriture effectuée.');
}
const source = readFileSync('js/products.js', 'utf8');
const sandbox = Object.create(null);
vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
new vm.Script(`${source}\n;globalThis.__catalog = VATHINI_PRODUCTS;`, { filename: 'js/products.js' }).runInContext(sandbox, { timeout: 1000 });
const products = sandbox.__catalog;
if (!products || typeof products !== 'object' || Array.isArray(products)) throw new Error('VATHINI_PRODUCTS introuvable.');
const entries = Object.entries(products);
if (!entries.length || entries.length > 1000) throw new Error('Catalogue vide ou trop volumineux.');
const sql = `INSERT INTO products (id,name,price_cents,pieces,type,description,contents,notice,warning,images,dimensions,weight,parts_price,parts_price_date,is_active)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
ON CONFLICT(id) DO UPDATE SET name=excluded.name,price_cents=excluded.price_cents,pieces=excluded.pieces,type=excluded.type,description=excluded.description,contents=excluded.contents,notice=excluded.notice,warning=excluded.warning,images=excluded.images,dimensions=excluded.dimensions,weight=excluded.weight,parts_price=excluded.parts_price,parts_price_date=excluded.parts_price_date,is_active=1`;
function field(v, name) { if (v == null) return null; if (typeof v !== 'string' || v.length > 10000) throw new Error(`Champ invalide : ${name}`); return v; }
function jsonArray(v, name) { if (!Array.isArray(v) || v.length > 30 || !v.every(x => typeof x === 'string' && x.length <= 500)) throw new Error(`Liste invalide : ${name}`); return JSON.stringify(v); }
const statements = entries.map(([id, p]) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Identifiant invalide : ${id}`);
  if (!p || typeof p !== 'object') throw new Error(`Produit invalide : ${id}`);
  if (
  typeof p.name !== 'string' ||
  !p.name.trim() ||
  p.name.length > 200
) {
  throw new Error(`Nom de produit invalide : ${id}`);
}
  const match = typeof p.price === 'string' && /^\d+(?:[.,]\d{1,2})?\s*€?$/.exec(p.price.trim());
  if (!match) throw new Error(`Prix invalide : ${id}`);
  const numeric = p.price.trim().replace('€', '').trim().replace(',', '.');
  const [euros, cents = ''] = numeric.split('.');
  const priceCents = Number(euros) * 100 + Number(cents.padEnd(2, '0'));
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) throw new Error(`Prix hors limites : ${id}`);
  return { sql, params: [id, field(p.name, 'name'), priceCents, field(p.pieces, 'pieces'), field(p.type, 'type'), field(p.description, 'description'), jsonArray(p.contents, 'contents'), field(p.notice, 'notice'), field(p.warning, 'warning'), jsonArray(p.images, 'images'), field(p.dimensions, 'dimensions'), field(p.weight, 'weight'), field(p.partsPrice, 'partsPrice'), field(p.partsPriceDate, 'partsPriceDate')] };
});

// Toutes les validations sont terminées avant l'écriture.

const endpoint =
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    batch: statements
  })
});

const result = await response.json();

const hasErrors =
  !response.ok ||
  result.success !== true ||
  !Array.isArray(result.result) ||
  result.result.length !== statements.length ||
  result.result.some(item => item?.success !== true);

if (hasErrors) {
  throw new Error(
    `Échec ou réponse incomplète D1 : ${JSON.stringify(result.errors ?? result.result ?? []).slice(0, 500)}`
  );
}

console.log(
  `${statements.length} produit(s) synchronisé(s) en PRODUCTION. Aucun produit supprimé.`
);
