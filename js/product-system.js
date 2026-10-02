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

    currentImages =
        product.images;

    currentImage = 0;

    galleryDotsContainer.innerHTML = '';


    /* IMAGE PRINCIPALE */

    mainImage.src =
        currentImages[0];

    mainImage.alt =
        product.name;


    /* INDICATEURS */

    currentImages.forEach((image, index) => {

        const dot =
            document.createElement('button');

        dot.type = 'button';

        dot.className =
            'gallery-dot';

        dot.setAttribute(
            'aria-label',
            `Afficher l'image ${index + 1}`
        );


        if (index === 0) {

            dot.classList.add('active');

        }


        dot.addEventListener('click', () => {

            showImage(index);

        });


        galleryDotsContainer.appendChild(dot);

    });


    /* FLÈCHE */

    nextButton.hidden =
        currentImages.length <= 1;

}


/* ==========================
   AFFICHAGE IMAGE
========================== */

function showImage(index) {

    if (!currentImages.length) {
        return;
    }

    currentImage = index;

    const dots =
        galleryDotsContainer.querySelectorAll('.gallery-dot');


    mainImage.style.opacity = '0';


    setTimeout(() => {

        mainImage.src =
            currentImages[index];

        dots.forEach(dot => {

            dot.classList.remove('active');

        });

        dots[index].classList.add('active');

        mainImage.style.opacity = '1';

    }, 180);

}


/* ==========================
   IMAGE SUIVANTE
========================== */

nextButton.addEventListener('click', () => {

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


productTriggers.forEach(trigger => {

    trigger.addEventListener('click', () => {

        loadProduct(
            trigger.dataset.product
        );

    });

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