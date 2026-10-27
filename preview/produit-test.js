/* Fiche locale : récupère uniquement un produit publié en TEST. */
(()=>{
 if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const API=window.VATHINI_TEST_API||'',q=new URLSearchParams(location.search),id=q.get('id'),world=q.get('world');const status=document.getElementById('status'),article=document.getElementById('product'),hero=document.getElementById('hero'),thumbs=document.getElementById('thumbs');
 const back=new URL('catalogue-test.html',location.href);if(['monde-halloween','monde-vathini'].includes(world))back.searchParams.set('world',world);document.getElementById('back').href=back.href;
 function text(id,value){document.getElementById(id).textContent=value??'';}
 function fact(label,value){if(value===null||value===undefined||value==='')return;const li=document.createElement('li'),left=document.createElement('span'),right=document.createElement('strong');left.textContent=label;right.textContent=String(value);li.append(left,right);document.getElementById('facts').append(li);}
 function choose(images,i){hero.replaceChildren();const img=document.createElement('img');img.src=images[i];img.alt=`${textName} — photo ${i+1}`;hero.append(img);for(const [j,btn] of [...thumbs.children].entries())btn.setAttribute('aria-pressed',String(i===j));}
 let textName='Produit';
 async function load(){if(!id||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(id)){status.className='error';status.textContent='Identifiant produit invalide.';return;}
  if(API.includes('REMPLACER-')||!API.startsWith('https://')){status.className='error';status.textContent='Configurer l’URL du Worker dans config.js.';return;}
  try{const u=new URL(`/api/public/catalog-preview/product/${id}`,API),r=await fetch(u,{credentials:'omit',cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();if(data.environment!=='TEST'||!data.product||data.product.purchasable!==false)throw Error('Réponse inattendue');const p=data.product;textName=p.name||'Produit';document.title=`${textName} — Aperçu TEST VATHINI`;text('world-name',p.world_slug==='monde-halloween'?'Monde Halloween':p.world_slug==='monde-vathini'?'Monde VATHINI':p.world_slug);text('name',textName);text('price',Number.isInteger(p.price_cents)?(p.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}):'Prix indisponible');text('description',p.description||'');fact('Type',p.type||'Plan numérique');fact('Pièces',p.pieces);fact('Dimensions',p.dimensions);fact('Poids',p.weight);
   const images=Array.isArray(p.images)?p.images.filter(u=>typeof u==='string'&&u.startsWith('https://')).slice(0,4):[];
   if(images.length){images.forEach((src,i)=>{const btn=document.createElement('button');btn.type='button';btn.className='thumb';btn.setAttribute('aria-label',`Afficher la photo ${i+1}${i===0?' (principale)':''}`);const img=document.createElement('img');img.src=src;img.alt=`Miniature ${i+1}`;btn.append(img);btn.addEventListener('click',()=>choose(images,i));thumbs.append(btn);});choose(images,0);}else{hero.textContent='Aucune image disponible';thumbs.hidden=true;}
   status.hidden=true;article.hidden=false;
  }catch(e){status.className='error';status.textContent=`Impossible de charger cette fiche TEST (${e.message}).`;}}
 load();
})();
