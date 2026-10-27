/* VATHINI — PREVISUALISATION LOCALE D1 TEST. NE PAS DEPLOYER SUR LE SITE PUBLIC. */
(() => {
  const host = location.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') return;
  const endpoint = window.VATHINI_CATALOG_PREVIEW_URL;
  if (!endpoint || !endpoint.startsWith('https://')) return;
  const grid = document.querySelector('#catalogue-view .products-grid');
  if (!grid || typeof loadProduct !== 'function' || typeof VATHINI_PRODUCTS !== 'object') return;

  function asList(value) {
    if (Array.isArray(value)) return value.filter(v=>typeof v==='string');
    if (typeof value !== 'string') return [];
    try { const parsed=JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter(v=>typeof v==='string'); } catch(_) {}
    return value.trim() ? [value] : [];
  }
  function imagePath(value) {
    if (typeof value !== 'string') return '';
    const s=value.trim();
    if (/^(images\/[a-zA-Z0-9/_-]+\.(?:png|jpg|jpeg|webp)|https:\/\/[a-zA-Z0-9._/-]+\.(?:png|jpg|jpeg|webp))$/i.test(s)) return s;
    return '';
  }
  function normalize(row) {
    const images=asList(row.images).map(imagePath).filter(Boolean);
    return {
      name: String(row.name || ''), price: (Number(row.price_cents)/100).toFixed(2)+'€',
      pieces: String(row.pieces || ''), type:String(row.type || 'Plan numérique'),
      description:String(row.description || ''), contents:asList(row.contents),
      notice:String(row.notice || ''), warning:String(row.warning || ''),
      images: images.length ? images : ['images/logo-clair.png'],
      dimensions:String(row.dimensions || '—'), weight:String(row.weight || '—'),
      partsPrice:String(row.parts_price || '—'), partsPriceDate:String(row.parts_price_date || '—')
    };
  }
  function addCard(row, product) {
    const card=document.createElement('article'); card.className='product-card';
    const photoButton=document.createElement('button'); photoButton.type='button'; photoButton.className='product-image-link';
    photoButton.setAttribute('aria-label','Prévisualiser '+product.name);
    const photoBox=document.createElement('div'); photoBox.className='product-image';
    const img=document.createElement('img'); img.src=product.images[0]; img.alt=product.name;
    photoBox.append(img); photoButton.append(photoBox);
    const pieces=document.createElement('div'); pieces.className='product-pieces';
    const piecesText=document.createElement('span'); piecesText.textContent=product.pieces; pieces.append(piecesText);
    const info=document.createElement('div'); info.className='product-info';
    const h2=document.createElement('h2'); h2.textContent=product.name;
    const type=document.createElement('p'); type.className='product-type'; type.textContent=product.type;
    const price=document.createElement('p'); price.className='product-price'; price.textContent=product.price;
    info.append(h2,type,price);
    const actions=document.createElement('div'); actions.className='product-actions';
    const details=document.createElement('button'); details.type='button'; details.className='product-details-button'; details.textContent='Prévisualiser';
    const notice=document.createElement('p'); notice.textContent='TEST D1 — vente désactivée';
    notice.style.cssText='font-size:12px;color:#B48A5A;margin:8px 0;';
    const open=()=>{loadProduct(row.id); const cartButton=document.getElementById('sheet-cart-button'); if(cartButton){cartButton.hidden=true;} };
    details.addEventListener('click',open); photoButton.addEventListener('click',open);
    actions.append(details); card.append(photoButton,pieces,info,notice,actions); grid.append(card);
  }
  async function load() {
    try {
      const response=await fetch(endpoint,{mode:'cors',credentials:'omit',cache:'no-store'});
      if(!response.ok) throw new Error('HTTP '+response.status);
      const body=await response.json();
      if(body.environment!=='TEST'||!Array.isArray(body.products)) throw new Error('Invalid TEST catalog');
      let added=0;
      for(const row of body.products) {
        if(!row || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id) || !Number.isInteger(row.price_cents) || row.price_cents<0) continue;
        // Ne pas écraser le catalogue local ou ses prix, surtout pour la Boîte VATHINI.
        if(Object.hasOwn(VATHINI_PRODUCTS,row.id)) continue;
        const product=normalize(row);
        // Les produits créés dans D1 restent NON ACHETABLES dans cette prévisualisation.
        VATHINI_PRODUCTS[row.id]=product;
        addCard(row,product); added++;
      }
      const banner=document.createElement('p'); banner.textContent=`PRÉVISUALISATION LOCALE D1 TEST — ${added} nouveau(x) produit(s) — aucun achat possible pour ces produits.`;
      banner.style.cssText='padding:12px 16px;margin:12px 0;border:1px solid #B48A5A;color:#B48A5A;font-size:13px;';
      grid.before(banner);
    } catch(err) { console.warn('Catalogue TEST indisponible; catalogue local conservé.',err); }
  }
  document.addEventListener('click', e=>{
    if(e.target.closest('.product-back') || e.target.closest('[data-product="boite-vathini"]')) {
      const button=document.getElementById('sheet-cart-button'); if(button) button.hidden=false;
    }
  });
  load();
})();
