/* Prévisualisation TEST : carte compacte, lien vers fiche locale. */
(()=>{
 if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const API=window.VATHINI_TEST_API||'',select=document.getElementById('world'),status=document.getElementById('status'),grid=document.getElementById('products');
 const params=new URLSearchParams(location.search),initial=params.get('world');if(['monde-vathini','monde-halloween'].includes(initial))select.value=initial;
 function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
 function card(p){const a=el('a','card');const link=new URL('produit-test.html',location.href);link.searchParams.set('id',p.id);link.searchParams.set('world',p.world_slug);a.href=link.href;a.setAttribute('aria-label',`Voir la fiche de ${p.name}`);
  const visual=el('div','visual');if(p.cover_url){const img=el('img');img.alt=`Vue principale de ${p.name}`;img.loading='lazy';img.src=p.cover_url;img.onerror=()=>visual.replaceChildren(el('span','noimg','Image indisponible'));visual.append(img);}else visual.append(el('span','noimg','Aucune image'));
  const body=el('div','content');body.append(el('h2','',p.name||'Produit sans nom'));body.append(el('p','price',Number.isInteger(p.price_cents)?(p.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}):'Prix indisponible'));body.append(el('p','meta',`${p.pieces??'—'} pièces · ${p.type||'Plan numérique'}`));body.append(el('p','meta','Voir la fiche →'));a.append(visual,body);return a;}
 async function load(){grid.replaceChildren();status.className='';status.textContent='Chargement du catalogue TEST…';if(API.includes('REMPLACER-')||!API.startsWith('https://')){status.className='error';status.textContent='Configurer l’URL du Worker dans config.js.';return;}
  try{const u=new URL('/api/public/catalog-preview',API);u.searchParams.set('world',select.value);const r=await fetch(u,{credentials:'omit',cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();if(data.environment!=='TEST'||!Array.isArray(data.products))throw Error('Réponse inattendue');const products=data.products.filter(p=>p&&p.world_slug===select.value&&p.purchasable===false);for(const p of products)grid.append(card(p));status.textContent=products.length?`${products.length} produit(s) publié(s) en TEST dans ce monde.`:'Aucun produit publié en TEST dans ce monde.';}
  catch(e){status.className='error';status.textContent=`Impossible de charger le catalogue TEST (${e.message}).`;}}
 select.addEventListener('change',()=>{const u=new URL(location.href);u.searchParams.set('world',select.value);history.replaceState(null,'',u);load();});load();
})();
