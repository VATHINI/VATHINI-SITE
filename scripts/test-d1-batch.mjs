
const {
  CLOUDFLARE_API_TOKEN_TEST: token,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_D1_DATABASE_ID_TEST: databaseId
} = process.env;

const EXPECTED_TEST_DB = 'e8ea1f42-bee8-482a-aee3-e09adc140394';

if (
  !token ||
  !/^[a-f0-9]{32}$/i.test(accountId ?? '') ||
  databaseId !== EXPECTED_TEST_DB
) {
  throw new Error('Configuration TEST invalide. Aucune écriture effectuée.');
}

const endpoint =
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

const statements = [
  {
    sql: `UPDATE catalogue_sync_test
          SET price_cents = ?
          WHERE id = ?`,
    params: [1999, 'test-produit-1']
  },
  {
    sql: `INSERT INTO catalogue_sync_test
          (id, name, price_cents)
          VALUES (?, ?, ?)`,
    params: ['test-produit-2', null, 2999]
  }
];

console.log('Début du test transactionnel D1.');

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

console.log('Statut HTTP :', response.status);
console.log('Réponse Cloudflare :', JSON.stringify(result, null, 2));

const errors = [
  ...(result.errors ?? []).map(e => e.message ?? String(e)),
  ...(result.result ?? [])
    .filter(r => r.success === false)
    .map(r => String(r.error ?? 'Erreur SQL'))
];

if (response.ok && result.success && errors.length === 0) {
  throw new Error('Résultat inattendu : aucune erreur SQL signalée.');
}

if (!errors.some(message => /NOT NULL|constraint/i.test(message))) {
  throw new Error(
    `Test non concluant : erreur SQL attendue introuvable. ${errors.join(' | ')}`
  );
}

console.log('Erreur de contrainte SQL détectée.');
console.log('Il reste à vérifier si la première écriture a été annulée.');
console.log('Test terminé. Vérifier les données dans la console D1 TEST.');
