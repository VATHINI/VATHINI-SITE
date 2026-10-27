// VATHINI - Formulaire DEVIS - PROD
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('devis-form');
    if (!form) return;
    const errorBox = form.querySelector('.form-error');
    const successBox = form.querySelector('.form-success');
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorBox.style.display = 'none';
        if (successBox) successBox.style.display = 'none';
        if (!form.checkValidity()) {
            errorBox.textContent = 'Veuillez remplir tous les champs et accepter la politique de confidentialité.';
            errorBox.style.display = 'block';
            form.reportValidity();
            return;
        }
        const token = window.turnstile?.getResponse(form.querySelector('.cf-turnstile'));
        if (!token) {
            errorBox.textContent = 'Veuillez terminer la vérification antispam.';
            errorBox.style.display = 'block';
            return;
        }
        const data = new FormData(form);
        const payload = {
            type: 'devis',
            prenom: data.get('prenom'),
            nom: data.get('nom'),
            email: data.get('email'),
            projet: data.get('projet'),
            profil: data.get('profil'),
            privacy_accepted: data.get('privacy') === 'on',
            turnstileToken: token
        };
        button.disabled = true;
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || result.ok !== true) {
                throw new Error(result.message || 'Envoi refuse.');
            }
            form.reset();
            if (successBox) {
                successBox.textContent = 'Votre demande de devis a bien été enregistrée.';
                successBox.style.display = 'block';
            }
        } catch (error) {
            errorBox.textContent = error.message || 'Envoi impossible. Veuillez réessayer.';
            errorBox.style.display = 'block';
        } finally {
            window.turnstile?.reset(form.querySelector('.cf-turnstile'));
            button.disabled = false;
        }
    });
});
