/* Intégration locale, lecture seule. Aucune action panier, commande ou CAWL. */
(()=>{
 'use strict';
 if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const root=document.getElementById('vathini-catalogue-grid');
 const status=document.getElementById('vathini-catalogue-status');
 if(!root||!status)return;
 const api=window.VATHINI_TEST_API||'';
 const workerURL=(()=>{try{const u=new URL(api);return u.protocol==='https:'&&!u.hostname.startsWith('REMPLACER-')&&!api.includes('REMPLACER-')?u:null;}catch{return null;}})();
 const text=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
 function card(p){
  const article=text('article','product-card');
  const a=text('a','vathini-test-card-link');
  const link=new URL('preview/produit-test.html',location.href);
  link.searchParams.set('id',p.id);link.searchParams.set('world','monde-halloween');a.href=link.href;
  const visual=text('div','product-image');
  if(p.cover_url){const img=text('img');img.src=p.cover_url;img.loading='lazy';img.alt=`${p.name} — photographie principale`;img.addEventListener('error',()=>visual.replaceChildren(text('span','vathini-test-noimage','Image indisponible')));visual.append(img);}
  else visual.append(text('span','vathini-test-noimage','Image indisponible'));
  a.append(visual,text('div','product-pieces',`${p.pieces??'—'} pièces`));
  const info=text('div','product-info');info.append(text('h2','',p.name||'Produit'),text('p','product-type',p.type||'Plan numérique'));
  info.append(text('p','product-price',Number.isInteger(p.price_cents)?(p.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}):'Prix indisponible'));
  a.append(info,text('span','vathini-test-view','Voir le produit'));article.append(a);return article;
 }
 async function load(){
  if(!workerURL){status.textContent='Renseigner l’URL du Worker TEST dans js/catalogue-mondes-test-config.js.';return;}
  try{
   const url=new URL('/api/public/catalog-preview',workerURL);url.searchParams.set('world','monde-halloween');
   const response=await fetch(url,{credentials:'omit',cache:'no-store'});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const data=await response.json();if(data.environment!=='TEST'||!Array.isArray(data.products))throw new Error('Réponse inattendue');
   const products=data.products.filter(p=>p&&p.world_slug==='monde-halloween'&&p.purchasable===false);
   root.replaceChildren(...products.map(card));status.textContent=products.length?`${products.length} création(s) dans ce monde.`:'Aucun produit publié en TEST dans ce monde.';
  }catch(error){status.textContent=`Catalogue TEST indisponible : ${error.message}`;}
 }
 load();
})();
