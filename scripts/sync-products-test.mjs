import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const EXPECTED_TEST_DB = 'e8ea1f42-bee8-482a-aee3-e09adc140394';
const { CLOUDFLARE_API_TOKEN_TEST: token, CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_D1_DATABASE_ID_TEST: databaseId } = process.env;
if (!token || !/^[a-f0-9]{32}$/i.test(accountId ?? '') || databaseId !== EXPECTED_TEST_DB) {
  throw new Error('Configuration GitHub absente ou identifiant de base de test incorrect. Aucune écriture effectuée.');
}
const source = readFileSync('js/products.js', 'utf8');
const sandbox = Object.create(null);
vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
const catalog = new vm.Script(`${source}\n;globalThis.__catalog = VATHINI_PRODUCTS;`, { filename: 'js/products.js' }).runInContext(sandbox, { timeout: 1000 });
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
  const match = typeof p.price === 'string' && /^\d+(?:[.,]\d{1,2})?\s*€?$/.exec(p.price.trim());
  if (!match) throw new Error(`Prix invalide : ${id}`);
  const numeric = p.price.trim().replace('€', '').trim().replace(',', '.');
  const [euros, cents = ''] = numeric.split('.');
  const priceCents = Number(euros) * 100 + Number(cents.padEnd(2, '0'));
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) throw new Error(`Prix hors limites : ${id}`);
  return { sql, params: [id, field(p.name, 'name'), priceCents, field(p.pieces, 'pieces'), field(p.type, 'type'), field(p.description, 'description'), jsonArray(p.contents, 'contents'), field(p.notice, 'notice'), field(p.warning, 'warning'), jsonArray(p.images, 'images'), field(p.dimensions, 'dimensions'), field(p.weight, 'weight'), field(p.partsPrice, 'partsPrice'), field(p.partsPriceDate, 'partsPriceDate')] };
});
// All local validation completes before any remote write.
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
for (let i = 0; i < statements.length; i++) {
  const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(statements[i]) });
  const result = await response.json();
  if (!response.ok || !result.success || result.result?.some(r => r.success === false)) {
    throw new Error(`Échec Cloudflare D1 pour ${entries[i][0]} : ${JSON.stringify(result.errors ?? result.result?.flatMap(r => r.error ?? []) ?? []).slice(0, 500)}`);
  }
  console.log(`Synchronisé dans la base de TEST : ${entries[i][0]}`);
}
console.log(`${statements.length} produit(s) synchronisé(s) en TEST. Aucun produit supprimé.`);
