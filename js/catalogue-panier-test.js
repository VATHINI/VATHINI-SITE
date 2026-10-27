/* Test local uniquement : aucun secret et aucun paiement. */
const VATHINI_TEST_API = 'https://vathini-catalogue-read-test.vathini-cor.workers.dev/api/catalogue';
const VATHINI_PRODUCTS = Object.create(null);
const VATHINI_TEST_PURCHASABLE = new Set();
const statusEl = document.getElementById('catalogue-test-status');
const actionsEl = document.getElementById('catalogue-test-actions');
async function reloadTestCatalogue() {
 statusEl.textContent='Chargement du catalogue D1 TEST…';
 actionsEl.replaceChildren();
 try {
  const res=await fetch(VATHINI_TEST_API,{cache:'no-store'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  const body=await res.json();
  if(!Array.isArray(body.products))throw new Error('Réponse catalogue invalide');
  for(const k of Object.keys(VATHINI_PRODUCTS))delete VATHINI_PRODUCTS[k];
  VATHINI_TEST_PURCHASABLE.clear();
  for(const p of body.products){
   if(typeof p.id!=='string'||typeof p.name!=='string'||!Number.isSafeInteger(p.price_cents)||p.price_cents<0)continue;
   VATHINI_PRODUCTS[p.id]={name:p.name,price:(p.price_cents/100).toFixed(2),images:[]};
   if(p.purchasable)VATHINI_TEST_PURCHASABLE.add(p.id);
  }
  const cart=getCart().filter(id=>VATHINI_TEST_PURCHASABLE.has(id));
  saveCart(cart);
  for(const p of body.products){
   const line=document.createElement('div');line.style.margin='8px 0';
   const name=document.createElement('span');
   name.textContent=p.name+' — '+(p.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})+' ';
   const btn=document.createElement('button');btn.type='button';btn.style.padding='6px 12px';
   btn.textContent=p.purchasable?'Ajouter au panier':'Vente désactivée';
   btn.disabled=!p.purchasable;
   btn.onclick=()=>{addToCart(p.id);};
   line.append(name,btn);actionsEl.append(line);
  }
  statusEl.textContent=body.products.length+' produit(s) publié(s), '+VATHINI_TEST_PURCHASABLE.size+' achetable(s).';
  renderCart();
 }catch(e){
  VATHINI_TEST_PURCHASABLE.clear();
  for(const k of Object.keys(VATHINI_PRODUCTS))delete VATHINI_PRODUCTS[k];
  statusEl.textContent='Catalogue inaccessible : '+e.message+'. Panier bloqué par sécurité.';
  renderCart();
 }
}
document.getElementById('catalogue-test-refresh').addEventListener('click',reloadTestCatalogue);
reloadTestCatalogue();
