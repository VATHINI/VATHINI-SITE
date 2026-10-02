/* ==========================
   COMPOSANTS GLOBAUX VATHINI
========================== */

async function loadComponent(selector, file) {
    const container = document.querySelector(selector);

    if (!container) return;

    try {
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`Impossible de charger ${file}`);
        }

        const html = await response.text();
        container.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}


/* HEADER */
loadComponent("#site-header", "components/header.html");


/* FOOTER */
loadComponent("#site-footer", "components/footer.html");