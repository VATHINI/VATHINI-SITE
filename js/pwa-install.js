/* ==========================
   INSTALLATION PWA VATHINI
========================== */

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
});

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
});

document.addEventListener("click", async (event) => {

    const button = event.target.closest("#install-vathini");

    if (!button) return;

    const message = document.getElementById("pwa-install-message");

    if (!message) return;

    const showMessage = (text) => {
        message.textContent = text;
        message.hidden = false;
    };

    // Installation proposée par le navigateur
    if (deferredInstallPrompt) {

        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;

        try {
            await promptEvent.prompt();

            const choice = await promptEvent.userChoice;

            if (choice.outcome === "accepted") {
                showMessage("Installation de VATHINI acceptée !");
            } else {
                showMessage("Vous pourrez installer VATHINI plus tard.");
            }

        } catch (error) {
            showMessage("Utilisez le menu de votre navigateur pour installer VATHINI.");
        }

        return;
    }

    // iPhone / iPad
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
    ).matches || navigator.standalone === true;

    if (isStandalone) {
        showMessage("VATHINI est déjà ouvert en mode application.");
        return;
    }

    if (isIOS) {
        showMessage(
            "Pour installer VATHINI, ouvrez le menu de partage ou le menu du navigateur, puis choisissez « Sur l’écran d’accueil »."
        );
        return;
    }

    // Autres navigateurs
    showMessage(
        "Pour installer VATHINI, ouvrez le menu de votre navigateur et recherchez « Installer l'application » ou « Ajouter à l'écran d'accueil »."
    );

});