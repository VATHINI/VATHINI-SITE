
/* ==========================
   PANIER VATHINI
========================== */

const VATHINI_CART_KEY = 'vathini-cart-d1-test';


/* ==========================
   STOCKAGE
========================== */

function getCart() {

    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem(VATHINI_CART_KEY) || '[]'
            );

        if (!Array.isArray(savedCart)) {
            return [];
        }

        return [
            ...new Set(savedCart)
        ].filter(id =>
            typeof id === 'string' &&
            Object.hasOwn(VATHINI_PRODUCTS, id)
        );

    } catch (error) {

        console.error(
            'Impossible de lire le panier :',
            error
        );

        return [];

    }

}


function saveCart(cart) {

    try {

        localStorage.setItem(
            VATHINI_CART_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            'Impossible de sauvegarder le panier :',
            error
        );

    }

}


/* ==========================
   NOTIFICATIONS VATHINI
========================== */

let cartNotificationTimeout;

function showCartNotification(message, type = 'success') {

    let notification =
        document.getElementById('vathini-cart-notification');

    if (!notification) {

        notification = document.createElement('div');

        notification.id = 'vathini-cart-notification';
        notification.className = 'vathini-cart-notification';

        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');

        document.body.appendChild(notification);

    }

    clearTimeout(cartNotificationTimeout);

    notification.classList.remove('visible');

    notification.textContent = message;

    notification.classList.toggle(
        'notification-warning',
        type === 'warning'
    );

    // Relance l'animation lors de clics successifs.
    void notification.offsetWidth;

    notification.classList.add('visible');

    cartNotificationTimeout = setTimeout(() => {

        notification.classList.remove('visible');

    }, 3000);

}


/* ==========================
   AJOUTER UN PRODUIT
========================== */

function addToCart(productId) {

    if (!Object.hasOwn(VATHINI_PRODUCTS, productId) || !VATHINI_TEST_PURCHASABLE.has(productId)) {
        return false;
    }

    const cart = getCart();

    if (cart.includes(productId)) {

        showCartNotification(
    'Ce produit est déjà dans votre panier.',
    'warning'
);

        return false;

    }

    cart.push(productId);

    saveCart(cart);

    showCartNotification(
    'Produit ajouté à votre panier !'
);

    renderCart();
    refreshPromotion();

    return true;

}


/* ==========================
   SUPPRIMER UN PRODUIT
========================== */

function removeFromCart(productId) {

    const cart =
        getCart().filter(id => id !== productId);

    saveCart(cart);

    renderCart();
    refreshPromotion();

}


/* ==========================
   CONVERSION DES PRIX
========================== */

function getProductPrice(product) {

    const price = String(product.price)
        .replace(',', '.')
        .replace(/[^\d.]/g, '');

    const value = Number(price);

    return Number.isFinite(value) ? value : 0;

}


function formatPrice(amount) {

    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);

}


/* ==========================
   CODES PROMO — estimation depuis D1
========================== */
const VATHINI_PROMO_KEY = 'vathini-promo-code-d1-test';
const VATHINI_PROMO_URL = ''; // Pas de requête promo dans ce test
let vathiniPromoResult = null;
let vathiniPromoRequest = 0;
function getSavedPromoCode() { return sessionStorage.getItem(VATHINI_PROMO_KEY) || ''; }
async function refreshPromotion() {
    const code = ''; // Désactivé dans ce test
    const cart = getCart();
    const requestId = ++vathiniPromoRequest;
    vathiniPromoResult = null;
    const status = document.getElementById('panier-promo-status');
    const input = document.getElementById('panier-promo-code');
    if (input && code) input.value = code;
    if (!code || !cart.length) { renderCart(); return; }
    if (status) status.textContent = 'Vérification du code...';
    try {
        const response = await fetch(VATHINI_PROMO_URL, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({promoCode:code, products:cart})
        });
        const result = await response.json();
        if (requestId !== vathiniPromoRequest) return;
        if (!response.ok || !result.success) throw new Error(result.message || 'Code promo invalide.');
        vathiniPromoResult = result;
        if (status) status.textContent = `Code ${result.code} appliqué.`;
    } catch (error) {
        if (requestId !== vathiniPromoRequest) return;
        if (status) status.textContent = error.message || 'Vérification impossible.';
    }
    renderCart();
}
function setupPromotion() {
    const input = document.getElementById('panier-promo-code');
    const apply = document.getElementById('panier-promo-apply');
    const remove = document.getElementById('panier-promo-remove');
    if (!input || !apply || !remove) return;
    apply.addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(code)) {
            document.getElementById('panier-promo-status').textContent = 'Format du code invalide.';
            return;
        }
        sessionStorage.setItem(VATHINI_PROMO_KEY, code);
        refreshPromotion();
    });
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); apply.click(); } });
    remove.addEventListener('click', () => {
        sessionStorage.removeItem(VATHINI_PROMO_KEY);
        input.value = '';
        vathiniPromoResult = null;
        ++vathiniPromoRequest;
        document.getElementById('panier-promo-status').textContent = '';
        renderCart();
    });
    refreshPromotion();
}

/* ==========================
   AFFICHAGE DU PANIER
========================== */

function renderCart() {

    updateCartCounter();

    const itemsContainer =
        document.getElementById('panier-items');

    if (!itemsContainer) {
        return;
    }

    const emptyMessage =
        document.getElementById('panier-empty');

    const countElement =
        document.getElementById('panier-count');

    const subtotalElement =
        document.getElementById('panier-subtotal');

    const totalElement =
        document.getElementById('panier-total');

    const checkoutButton =
        document.getElementById('panier-checkout');


    const cart = getCart();

    let totalCents = 0;

    itemsContainer.replaceChildren();


    cart.forEach(productId => {

        const product =
            VATHINI_PRODUCTS[productId];

        const priceCents =
            Math.round(getProductPrice(product) * 100);

        totalCents += priceCents;


        /* LIGNE PRODUIT */

        const item =
            document.createElement('div');

        item.className = 'panier-item';


        /* IMAGE */

        const imageWrapper =
            document.createElement('div');

        imageWrapper.className =
            'panier-item-image';

        const image =
            document.createElement('img');

        image.src = product.images[0] || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        image.alt = product.name;
        image.loading = 'lazy';

        imageWrapper.appendChild(image);


        /* NOM */

        const name =
            document.createElement('div');

        name.className = 'panier-item-name';
        name.textContent = product.name;


        /* PRIX */

        const price =
            document.createElement('div');

        price.className = 'panier-item-price';

        price.textContent =
            formatPrice(priceCents / 100);


        /* SUPPRESSION */

        const removeButton =
            document.createElement('button');

        removeButton.type = 'button';
        removeButton.className =
            'panier-item-remove';

        removeButton.textContent = '×';

        removeButton.setAttribute(
            'aria-label',
            `Retirer ${product.name} du panier`
        );

        removeButton.addEventListener(
            'click',
            () => removeFromCart(productId)
        );


        /* ASSEMBLAGE */

        item.append(
            imageWrapper,
            name,
            price,
            removeButton
        );

        itemsContainer.appendChild(item);

    });


    /* RÉCAPITULATIF */

    const formattedTotal =
        formatPrice(totalCents / 100);

    countElement.textContent = cart.length;

    subtotalElement.textContent =
        formattedTotal;

    const validPromo = vathiniPromoResult &&
        vathiniPromoResult.subtotalCents === totalCents &&
        vathiniPromoResult.code === getSavedPromoCode();
    const discount = validPromo ? vathiniPromoResult.discountCents : 0;
    totalElement.textContent = formatPrice((totalCents - discount) / 100);
    const discountRow = document.getElementById('panier-discount-row');
    const discountValue = document.getElementById('panier-discount');
    const removePromo = document.getElementById('panier-promo-remove');
    if (discountRow) discountRow.hidden = !validPromo;
    if (discountValue) discountValue.textContent = '-' + formatPrice(discount / 100);
    if (removePromo) removePromo.hidden = !getSavedPromoCode();


    /* PANIER VIDE */

    emptyMessage.hidden =
        cart.length !== 0;


    /* PAIEMENT */

    // Désactivé jusqu'à l'intégration
    // sécurisée de CAWL.

    checkoutButton.disabled = true; checkoutButton.textContent = 'PAIEMENT DÉSACTIVÉ — TEST';

}


/* ==========================
   BOUTONS AJOUT AU PANIER
========================== */

document.addEventListener('click', event => {

    const button =
        event.target.closest(
            '[data-add-to-cart]'
        );

    if (!button) {
        return;
    }

    event.preventDefault();

    const productId =
        button.dataset.product;

    addToCart(productId);

});


/* ==========================
   INITIALISATION
========================== */

// Initialisation différée : catalogue chargé depuis D1 TEST avant le rendu.


/* ==========================
   COMPTEUR HEADER
========================== */

function updateCartCounter() {

    const counter =
        document.getElementById('header-cart-count');

    if (!counter) {
        return;
    }

    const count = getCart().length;

    counter.textContent = count;
    counter.hidden = count === 0;

}

const checkoutButton = document.getElementById('panier-checkout');

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (getCart().length > 0) {
            showCartNotification('Paiement volontairement désactivé dans ce test.', 'warning');
        }
    });
}

