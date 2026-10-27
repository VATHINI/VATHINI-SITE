/* VATHINI — Synchronisation publique du catalogue (lecture seule). */
(()=>{
 'use strict';
 const API='https://vathini-news-public.vathini-cor.workers.dev';
 window.VATHINI_CATALOGUE_READY=false;
 const money=n=>(n/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
 const asText=v=>typeof v==='string'?v:'';
 const base=API+'/';
 function mapProduct(p){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(p.id)||!Number.isSafeInteger(p.price_cents)||p.price_cents<0)return null;
  const imgs=Array.isArray(p.images)?p.images.filter(x=>typeof x==='string'&&/^\/api\/product-image\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(x)).slice(0,4).map(x=>new URL(x.slice(1),base).href):[];
  let contents=[];try{const raw=p.contents;if(Array.isArray(raw))contents=raw;else if(typeof raw==='string'){const parsed=JSON.parse(raw);if(Array.isArray(parsed))contents=parsed;}}catch{}
  return {id:p.id,world_slug:p.world_slug,purchasable:p.purchasable===true,name:asText(p.name),price:money(p.price_cents),pieces:Number.isFinite(Number(p.pieces))?`${p.pieces} pièces`:asText(p.pieces),type:asText(p.type),description:asText(p.description),contents:contents.filter(x=>typeof x==='string'),notice:asText(p.notice),warning:asText(p.warning),images:imgs,dimensions:asText(p.dimensions),weight:asText(p.weight),partsPrice:asText(p.parts_price),partsPriceDate:asText(p.parts_price_date)};
 }
 async function load(){
  try{
   const r=await fetch(API+'/api/catalogue',{mode:'cors',credentials:'omit',cache:'no-store'});
   if(!r.ok)throw Error('HTTP '+r.status);
   const data=await r.json();if(data.environment!=='PROD'||!Array.isArray(data.products))throw Error('Catalogue inattendu');
   const active=new Set();const byWorld=[];
   for(const id of Object.keys(VATHINI_PRODUCTS))delete VATHINI_PRODUCTS[id];
   for(const raw of data.products){const p=mapProduct(raw);if(!p)continue;
    // Produits non achetables : visibles dans leur Monde, mais jamais ajoutables au panier.
    VATHINI_PRODUCTS[p.id]=p;if(p.purchasable)active.add(p.id);
    if(p.world_slug==='monde-vathini')byWorld.push(p);
   }
   // N'altère pas la disponibilité des produits historiques en cas d'incohérence API.
   window.VATHINI_PUBLIC_CATALOGUE={products:data.products,activeIds:active};
   const grid=document.querySelector('#catalogue-view .products-grid, #catalogue-view .product-grid');
   if(grid){
    // Les cartes statiques restent en place. Les produits supplémentaires sont injectés sans HTML non fiable.
    const existing=new Set([...grid.querySelectorAll('[data-product]')].map(e=>e.dataset.product));
    for(const p of byWorld){if(existing.has(p.id))continue;
     const card=document.createElement('article');card.className='product-card';
     const visual=document.createElement('button');visual.type='button';visual.className='product-image-link';visual.dataset.product=p.id;
     if(p.images[0]){const img=document.createElement('img');img.src=p.images[0];img.alt=p.name;img.loading='lazy';visual.append(img);}
     const title=document.createElement('h2');title.textContent=p.name;
     const info=document.createElement('div');info.className='product-info';info.append(title);
     const price=document.createElement('p');price.className='product-price';price.textContent=p.price;info.append(price);
     const details=document.createElement('button');details.type='button';details.className='product-details-button';details.dataset.product=p.id;details.textContent='Voir le Produit';
     const add=document.createElement('button');add.type='button';add.className='add-cart-button';add.dataset.product=p.id;add.dataset.addToCart='';add.textContent=p.purchasable?'Ajouter au Panier':'Indisponible';add.disabled=!p.purchasable;
     card.append(visual,info,details,add);grid.append(card);existing.add(p.id);
    }
   }
   window.VATHINI_CATALOGUE_READY=true;
   document.querySelectorAll('[data-add-to-cart], [data-addtocart], .add-cart-button').forEach(btn=>{const id=btn.dataset.product;if(id){btn.disabled=!active.has(id);}});
   document.dispatchEvent(new CustomEvent('vathini:catalogue-ready'));
  }catch(e){window.VATHINI_CATALOGUE_READY=false;window.VATHINI_PUBLIC_CATALOGUE={products:[],activeIds:new Set()};document.querySelectorAll('[data-add-to-cart], [data-addtocart], .add-cart-button').forEach(btn=>btn.disabled=true);console.warn('Catalogue public indisponible :',e.message);document.dispatchEvent(new CustomEvent('vathini:catalogue-error'));}
 }
 load();
})();
