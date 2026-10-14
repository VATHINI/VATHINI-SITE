/* ==========================
   RECAPITULATIF COMMANDE
========================== */
(function () {
    'use strict';

    const empty = document.getElementById('commande-empty');
    const layout = document.getElementById('commande-layout');
    const items = document.getElementById('commande-items');
    const count = document.getElementById('commande-count');
    const total = document.getElementById('commande-total');
    const organization = document.getElementById('commande-organization');
    const organizationName = document.getElementById('commande-organization-name');

    if (!empty || !layout || !items || !count || !total) return;

    function renderOrder() {
        const cart = getCart();
        const hasItems = cart.length > 0;
        empty.hidden = hasItems;
        layout.hidden = !hasItems;
        items.replaceChildren();
        let totalCents = 0;

        for (const productId of cart) {
            const product = VATHINI_PRODUCTS[productId];
            if (!product) continue;
            const cents = Math.round(getProductPrice(product) * 100);
            totalCents += cents;

            const line = document.createElement('div');
            line.className = 'commande-item';
            const name = document.createElement('span');
            name.textContent = product.name;
            const price = document.createElement('strong');
            price.textContent = formatPrice(cents / 100);
            line.append(name, price);
            items.appendChild(line);
        }

        count.textContent = String(cart.length);
        total.textContent = formatPrice(totalCents / 100);
    }

    function updateClientType() {
        const selected = document.querySelector('input[name="clientType"]:checked');
        const isOrganization = selected && selected.value !== 'particulier';
        organization.hidden = !isOrganization;
        organizationName.required = Boolean(isOrganization);
        if (!isOrganization) organizationName.value = '';
    }

    document.querySelectorAll('input[name="clientType"]').forEach(input => {
        input.addEventListener('change', updateClientType);
    });

    window.addEventListener('storage', event => {
        if (event.key === 'vathini-cart') renderOrder();
    });

    updateClientType();
    renderOrder();

    
    /* ==========================
       TRANSMISSION DE COMMANDE
    ========================== */

    const payButton = document.getElementById('commande-pay');
    const form = document.getElementById('commande-form');
    const status = document.getElementById('commande-form-status');
    const paymentResult = document.getElementById('commande-payment-result');

    const API_URL = 'https://vathini-payments.vathini-cor.workers.dev/api/orders';
    let paymentInProgress = false;
    const IDEMPOTENCY_STORAGE_KEY = 'vathini-checkout-attempt';

   let paymentStatusChecks = 0;
const MAX_PAYMENT_STATUS_CHECKS = 24;

async function checkReturningPayment() {
    const orderId = sessionStorage.getItem('vathini-pending-order');
    let attempt = null;

try {
    attempt = JSON.parse(
        sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) || 'null'
    );
} catch {
    console.error('Données de suivi du paiement illisibles.');
    return;
}

    if (!orderId || !attempt?.key) return;

if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Vérification de votre paiement en cours...';
}
    try {
        const response = await fetch(
            'https://vathini-payments.vathini-cor.workers.dev/api/orders/status',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId,
                    idempotencyKey: attempt.key
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error('Statut indisponible.');
        }

        if (result.status === 'paid') {

            // Le paiement est confirmé dans D1.
// On vide uniquement le panier de cette commande.
// Retirer uniquement les produits de la commande payée.
const currentCart = getCart();

let purchasedProducts = [];

try {
    purchasedProducts = JSON.parse(
        sessionStorage.getItem('vathini-purchased-products') || '[]'
    );
} catch {
    purchasedProducts = [];
}

if (Array.isArray(purchasedProducts)) {
    const remainingCart = [...currentCart];

    for (const productId of purchasedProducts) {
        const index = remainingCart.indexOf(productId);

        if (index !== -1) {
            remainingCart.splice(index, 1);
        }
    }

    localStorage.setItem(
        'vathini-cart',
        JSON.stringify(remainingCart)
    );

    window.dispatchEvent(new Event('vathini-cart-updated'));
renderOrder();
}

empty.hidden = true;

if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Votre paiement a bien été confirmé ! Merci pour votre commande. VATHINI vous contactera prochainement pour la transmission de vos plans numériques.';
}

sessionStorage.setItem(
    'vathini-last-confirmed-order',
    orderId
);
sessionStorage.setItem(
    'vathini-last-confirmed-key',
    attempt.key
);

sessionStorage.removeItem('vathini-purchased-products');
    payButton.disabled = true;
    payButton.textContent = 'PAIEMENT CONFIRMÉ';

    sessionStorage.removeItem('vathini-pending-order');
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);

} else if (result.status === 'cancelled' || result.status === 'failed') {

    if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Votre paiement n’a pas abouti. Vous pouvez réessayer.';
}

    sessionStorage.removeItem('vathini-pending-order');
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);

    sessionStorage.removeItem('vathini-purchased-products');

    payButton.disabled = false;
    payButton.textContent = 'PROCÉDER AU PAIEMENT';

} else {

    if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Votre paiement est toujours en attente de confirmation. ' +
        'Ne lancez pas une nouvelle commande pour le moment.';
}

    payButton.disabled = true;
    payButton.textContent = 'PAIEMENT EN ATTENTE';
    // Nouvelle consultation dans 5 secondes,
// sans créer de commande ni relancer de paiement.
paymentStatusChecks++;

if (paymentStatusChecks < MAX_PAYMENT_STATUS_CHECKS) {
    setTimeout(checkReturningPayment, 5000);
} else {
    if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Votre paiement n’est pas encore confirmé. ' +
        'La vérification automatique est terminée. ' +
        'Veuillez revenir consulter votre commande ultérieurement.';
}

    payButton.disabled = true;
    payButton.textContent = 'CONFIRMATION EN ATTENTE';
}

}

} catch (error) {
    console.error('Vérification paiement VATHINI :', error);

    paymentStatusChecks++;

    payButton.disabled = true;
    payButton.textContent = 'CONFIRMATION EN ATTENTE';

    if (paymentStatusChecks < MAX_PAYMENT_STATUS_CHECKS) {
        if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'La vérification est temporairement indisponible. ' +
        'Nouvelle tentative dans quelques secondes...';
}

        setTimeout(checkReturningPayment, 5000);
    } else {
        if (paymentResult) {
    paymentResult.hidden = false;
    paymentResult.textContent =
        'Nous ne pouvons pas confirmer votre paiement actuellement. ' +
        'Ne recommencez pas le paiement avant d’avoir vérifié votre commande.';
}
        }
}

}

function getIdempotencyKey(orderData) {
    const fingerprint = JSON.stringify(orderData);

    let attempt = null;

    try {
        attempt = JSON.parse(
            sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY)
        );
    } catch {
        // Ancienne donnée illisible : une nouvelle clé sera créée.
    }

    if (
        attempt &&
        attempt.fingerprint === fingerprint &&
        typeof attempt.key === 'string'
    ) {
        return attempt.key;
    }

    const key = crypto.randomUUID();

    sessionStorage.setItem(
        IDEMPOTENCY_STORAGE_KEY,
        JSON.stringify({
            key,
            fingerprint
        })
    );

    return key;
}

    if (payButton && form && status) {

        payButton.disabled = false;

       payButton.addEventListener('click', async () => {

    if (paymentInProgress) return;

    if (sessionStorage.getItem('vathini-pending-order')) {
    status.textContent =
        'Une commande est déjà en attente de confirmation. ' +
        'Veuillez vérifier son paiement avant d’en commencer une nouvelle.';

    return;
}

    status.textContent = '';

            if (!form.reportValidity()) return;

            const cart = getCart();

            if (!cart.length) {
                status.textContent = 'Votre panier est vide.';
                return;
            }

            const data = {
    products: cart,
    clientType: form.querySelector(
        'input[name="clientType"]:checked'
    ).value,
                organizationName: organizationName.value.trim(),
                firstName: document.getElementById('commande-firstname').value.trim(),
                lastName: document.getElementById('commande-lastname').value.trim(),
                email: document.getElementById('commande-email').value.trim(),
                address: document.getElementById('commande-address').value.trim(),
                address2: document.getElementById('commande-address2').value.trim(),
                postalCode: document.getElementById('commande-postal').value.trim(),
                city: document.getElementById('commande-city').value.trim(),
                country: document.getElementById('commande-country').value.trim(),
                acceptCGV: document.getElementById('commande-cgv').checked,
                acceptDigital: document.getElementById('commande-digital').checked
            };
            data.idempotencyKey = getIdempotencyKey(data);

            const cgv = document.getElementById('commande-cgv');
            const digital = document.getElementById('commande-digital');

            if (!cgv.checked || !digital.checked) {
                status.textContent = 'Veuillez accepter les conditions obligatoires.';
                return;
            }

            paymentInProgress = true;
            payButton.disabled = true;
            payButton.textContent = 'PRÉPARATION DE LA COMMANDE...';

            try {

    const startTime = Date.now();

    const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                const elapsedTime = Date.now() - startTime;
const remainingTime = Math.max(0, 1500 - elapsedTime);

if (remainingTime > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingTime));
}

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Erreur de préparation.');
                }

                
if (
    typeof result.redirectUrl !== 'string' ||
    !result.redirectUrl
) {
    throw new Error('Adresse de paiement CAWL manquante.');
}

const paymentUrl = new URL(result.redirectUrl);

if (
    paymentUrl.protocol !== 'https:' ||
    !(
        paymentUrl.hostname === 'cawl-solutions.fr' ||
        paymentUrl.hostname.endsWith('.cawl-solutions.fr')
    )
) {
    throw new Error('Adresse de paiement non autorisée.');
}

if (
    typeof result.orderId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(result.orderId)
) {
    throw new Error('Identifiant de commande invalide.');
}

sessionStorage.removeItem('vathini-last-confirmed-order');
sessionStorage.removeItem('vathini-last-confirmed-key');
sessionStorage.setItem(
    'vathini-pending-order',
    result.orderId
);

sessionStorage.setItem(
    'vathini-purchased-products',
    JSON.stringify(cart)
);

status.textContent = 'Redirection vers le paiement sécurisé...';
payButton.textContent = 'REDIRECTION EN COURS...';
payButton.disabled = true;

window.location.assign(paymentUrl.href);

            } catch (error) {

    console.error('Erreur VATHINI :', error);

    status.textContent =
    'La préparation du paiement n’a pas pu être confirmée. ' +
    'Si vous avez déjà accédé à la page de paiement, ' +
    'ne lancez pas une nouvelle commande avant vérification.';

    paymentInProgress = false;
    payButton.disabled = false;
    payButton.textContent = 'PROCÉDER AU PAIEMENT';

}

        });

    }

        const pendingOrderId = sessionStorage.getItem('vathini-pending-order');
const checkoutAttempt = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);

const lastConfirmedOrder = sessionStorage.getItem(
    'vathini-last-confirmed-order'
);

const lastConfirmedKey = sessionStorage.getItem(
    'vathini-last-confirmed-key'
);

if (!pendingOrderId && lastConfirmedOrder && lastConfirmedKey) {
    fetch(`${API_URL}/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId: lastConfirmedOrder,
            idempotencyKey: lastConfirmedKey
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Vérification indisponible.');
        }

        return response.json();
    })
    .then(result => {
        if (result.success && result.status === 'paid') {
            if (paymentResult) {
                paymentResult.hidden = false;
                paymentResult.textContent =
                    'Votre paiement a bien été confirmé ! Merci pour votre commande. VATHINI vous contactera prochainement pour la transmission de vos plans numériques.';
            }

            empty.hidden = true;
        }
    })
    .catch(error => {
        console.error('Vérification de la dernière commande :', error);
    });
}

if (pendingOrderId && checkoutAttempt) {
    if (payButton) {
        payButton.disabled = true;
        payButton.textContent = 'CONSULTER LE STATUT DU PAIEMENT';
    }

    checkReturningPayment();
}

})();
