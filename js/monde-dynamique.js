/* Monde dynamique VATHINI : lecture seule, uniquement les Mondes publiés. */
(() => {
 'use strict';
 const slug=document.body.dataset.worldSlug;
 const title=document.getElementById('world-dynamic-name');
 const desc=document.getElementById('world-dynamic-description');
 const status=document.getElementById('world-dynamic-status');
 const grid=document.querySelector('#catalogue-view .products-grid');
 const API='https://vathini-news-public.vathini-cor.workers.dev';
 async function loadWorld(){
  try {
   if(slug==='__invalid__') throw Error('Monde introuvable');
   const r=await fetch(API+'/api/worlds',{credentials:'omit',cache:'no-store'});
   if(!r.ok) throw Error('API indisponible');
   const data=await r.json();
   if(data.environment!=='PROD'||!Array.isArray(data.worlds)) throw Error('Réponse invalide');
   const world=data.worlds.find(w=>w.slug===slug);
   if(!world) {grid?.replaceChildren();if(status)status.textContent='Ce Monde est indisponible ou n’est plus publié.';return;}
   title.textContent=world.name;
   desc.textContent=world.description||'Découvrez les créations de cet univers VATHINI.';
   document.title='VATHINI | '+world.name;
  } catch(e){grid?.replaceChildren();if(status)status.textContent='Impossible de charger ce Monde pour le moment.';console.warn('Monde VATHINI',e.message);}
 }
 loadWorld();
})();
