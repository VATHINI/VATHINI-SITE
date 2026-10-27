# VATHINI — Intégration locale TEST dans le véritable site

## Ce dossier est une COPIE de travail du site VATHINI

Les fichiers du site proviennent de l’archive « VATHINI SITE.zip » fournie. Aucun fichier de paiement, de panier, de catalogue PROD ni de Worker CAWL n’a été modifié. **NE PAS publier ce dossier sur GitHub Pages :** il contient un aperçu TEST.

## Mise en route

1. Ouvrir ce dossier dans VS Code (et non l’ancien ZIP de prévisualisation).
2. Dans `js/catalogue-mondes-test-config.js`, remplacer l’URL d’exemple par l’URL HTTPS exacte de `vathini-world-preview-test`, déjà déployé avec les bindings `DB` et `MEDIA`.
3. Ouvrir `galerie.html` avec Live Server (`127.0.0.1:5500`), puis cliquer sur « Monde - Halloween ».
4. Cliquer sur la carte « Le Porche d’Halloween ». La fiche de détail s’ouvre dans `preview/produit-test.html`, avec ses 4 images et ses caractéristiques.
5. Vérifier le retour au catalogue. Ne pas tester de paiement : il n’existe aucun bouton d’achat sur le parcours TEST.

## Fichiers ajoutés

- `monde-halloween-test.html` : page de monde dans la charte VATHINI, lecture D1/R2 TEST.
- `js/catalogue-mondes-test-config.js` : URL du Worker TEST, un seul point de configuration.
- `js/catalogue-mondes-test.js` : catalogue lecture seule, n’affiche que les produits explicitement publiés en TEST.
- `css/catalogue-mondes-test.css` : styles limités au parcours TEST.
- `preview/produit-test.html`, `preview/produit-test.js`, `preview/styles.css` : fiche TEST validée précédemment.
- `galerie.html` : ajout d’un lien local vers le Monde Halloween TEST.

## Ce qui reste à faire avant production

- Faire passer le catalogue de D1/R2 TEST à un catalogue PROD avec Worker de lecture séparé et domaine maîtrisé, et retirer les restrictions `localhost` une fois l’architecture validée.
- Raccorder les fiches dynamiques au vrai design des fiches VATHINI (cette version garde le design de la fiche TEST).
- Vérifier la publication, les données légales, l’accessibilité, les protections d’accès et la cohérence des prix serveur.
- Construire la livraison sécurisée des fichiers numériques après paiement confirmé, sans lien public permanent.
- Ne jamais ajouter le produit TEST directement à CAWL PROD.

## Finition Studio prévue

Ajouter dans « Vue d’ensemble » un lien en haut à droite : `Voir le site VATHINI` vers `https://www.vathini.fr/`, avec `target="_blank" rel="noopener noreferrer"`. La présente archive ne modifie pas Studio.
