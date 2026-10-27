/* ==========================
   SYSTÈME PRODUITS VATHINI
========================== */


/* ==========================
   ÉLÉMENTS PRINCIPAUX
========================== */

const catalogueView =
    document.getElementById('catalogue-view');

const productSheet =
    document.getElementById('product-sheet');

const productBack =
    productSheet.querySelector('.product-back');


/* ==========================
   INFORMATIONS PRODUIT
========================== */

const productName =
    document.getElementById('product-name');

const productType =
    document.getElementById('product-type');

const productPrice =
    document.getElementById('product-price');

const productPieces =
    document.getElementById('product-pieces');

const productDescription =
    document.getElementById('product-description');

const productNotice =
    document.getElementById('product-notice');

const productContents =
    document.getElementById('product-contents');

const productWarning =
    document.getElementById('product-warning');

const sheetCartButton =
    document.getElementById('sheet-cart-button');


/* ==========================
   GALERIE
========================== */

const mainImage =
    document.getElementById('product-main-image');

const galleryDotsContainer =
    document.getElementById('product-gallery-dots');

const nextButton =
    productSheet.querySelector('.gallery-next');

let currentImages = [];
let currentImage = 0;


/* ==========================
   CHARGEMENT PRODUIT
========================== */

function loadProduct(productId) {

    const product = VATHINI_PRODUCTS[productId];

    if (!product) {
        console.error(`Produit introuvable : ${productId}`);
        return;
    }


    /* INFORMATIONS */

    productName.textContent =
        product.name;

    productType.textContent =
        product.type;

    productPrice.textContent =
        product.price;

    productPieces.textContent =
        product.pieces;

    productDescription.textContent =
        product.description;

    productNotice.textContent =
        product.notice;

    productWarning.textContent =
        product.warning;


    /* CONTENU DU PRODUIT */

    productContents.innerHTML = '';

    product.contents.forEach(item => {

        const li =
            document.createElement('li');

        li.textContent = item;

        productContents.appendChild(li);
    });

    document.getElementById("product-dimensions").textContent =
    product.dimensions;

document.getElementById("product-weight").textContent =
    product.weight;

document.getElementById("product-parts-price").textContent =
    product.partsPrice;

document.getElementById("product-parts-price-date").textContent =
    product.partsPriceDate;


    /* PANIER */

    sheetCartButton.dataset.product =
        productId;


    /* GALERIE */

    loadGallery(product);


    /* AFFICHAGE */

    catalogueView.hidden = true;
    productSheet.hidden = false;


    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

}


/* ==========================
   CRÉATION GALERIE
========================== */

function loadGallery(product) {

    currentImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

    currentImage = 0;

    galleryDotsContainer.innerHTML = '';


    /* IMAGE PRINCIPALE */

    if (currentImages.length) mainImage.src = currentImages[0];
    else mainImage.removeAttribute('src');

    mainImage.alt =
        product.name;


    /* MINIATURES : même galerie pour les produits historiques et Studio */
    currentImages.forEach((image, index) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'gallery-dot gallery-thumbnail';
        thumb.setAttribute('aria-label', `Afficher la photo ${index + 1} sur ${currentImages.length}`);
        thumb.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        if (index === 0) thumb.classList.add('active');

        const preview = document.createElement('img');
        preview.src = image;
        preview.alt = '';
        preview.loading = 'lazy';
        thumb.appendChild(preview);
        thumb.addEventListener('click', () => showImage(index));
        galleryDotsContainer.appendChild(thumb);
    });

    /* Ancienne flèche conservée dans le HTML mais masquée. */
    if (nextButton) nextButton.hidden = true;

}


/* ==========================
   AFFICHAGE IMAGE
========================== */

function showImage(index) {
    if (!Number.isInteger(index) || index < 0 || index >= currentImages.length) return;
    currentImage = index;
    mainImage.src = currentImages[index];
    galleryDotsContainer.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
        const selected = i === index;
        thumb.classList.toggle('active', selected);
        thumb.setAttribute('aria-pressed', String(selected));
    });
}


/* ==========================
   IMAGE SUIVANTE
========================== */

if (nextButton) nextButton.addEventListener('click', () => {

    if (!currentImages.length) {
        return;
    }

    const nextIndex =
        (currentImage + 1) % currentImages.length;

    showImage(nextIndex);

});


/* ==========================
   OUVERTURE DES PRODUITS
========================== */

const productTriggers =
    document.querySelectorAll(
        '.product-image-link, .product-details-button'
    );


// Délégation : fonctionne également pour les cartes créées après chargement depuis D1.
document.addEventListener('click', event => {
    const trigger = event.target.closest('.product-image-link, .product-details-button');
    if (!trigger || !catalogueView.contains(trigger)) return;
    const id = trigger.dataset.product;
    if (id && Object.prototype.hasOwnProperty.call(VATHINI_PRODUCTS, id)) loadProduct(id);
});


/* ==========================
   RETOUR CATALOGUE
========================== */

productBack.addEventListener('click', () => {

    productSheet.hidden = true;
    catalogueView.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

});


/* ==========================
   LIGHTBOX
========================== */

const lightbox =
    document.getElementById('image-lightbox');

const lightboxImage =
    document.getElementById('lightbox-image');

const lightboxClose =
    document.querySelector('.lightbox-close');


mainImage.addEventListener('click', () => {

    lightboxImage.src =
        mainImage.src;

    lightboxImage.alt =
        mainImage.alt;

    lightbox.classList.add('active');

    document.body.style.overflow =
        'hidden';

});


function closeLightbox() {

    lightbox.classList.remove('active');

    document.body.style.overflow = '';

}


lightboxClose.addEventListener(
    'click',
    closeLightbox
);


lightbox.addEventListener(
    'click',
    event => {

        if (event.target === lightbox) {

            closeLightbox();

        }

    }
);


document.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Escape' &&
            lightbox.classList.contains('active')
        ) {

            closeLightbox();

        }

    }
);