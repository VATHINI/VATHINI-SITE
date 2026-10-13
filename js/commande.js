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

    const API_URL = 'https://vathini-payments.vathini-cor.workers.dev/api/orders';

    if (payButton && form && status) {

        payButton.disabled = false;

        payButton.addEventListener('click', async () => {

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

            const cgv = document.getElementById('commande-cgv');
            const digital = document.getElementById('commande-digital');

            if (!cgv.checked || !digital.checked) {
                status.textContent = 'Veuillez accepter les conditions obligatoires.';
                return;
            }

            payButton.disabled = true;
            payButton.textContent = 'PRÉPARATION DE LA COMMANDE...';

            try {

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Erreur de préparation.');
                }

                status.textContent =
                    'Commande test enregistrée avec succès ! Référence : ' +
                    result.orderId;

                console.log('Commande VATHINI créée :', result);

            } catch (error) {

                console.error('Erreur VATHINI :', error);

                status.textContent =
                    'Impossible de préparer la commande. Veuillez réessayer.';

            } finally {

                payButton.disabled = false;
                payButton.textContent = 'PROCÉDER AU PAIEMENT';

            }

        });

    }

})();
