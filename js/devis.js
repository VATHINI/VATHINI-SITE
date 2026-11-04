// VATHINI - Formulaire DEVIS - PROD
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('devis-form');
    if (!form) return;
    const errorBox = form.querySelector('.form-error');
    const successBox = form.querySelector('.form-success');
    const button = form.querySelector('button[type="submit"]');
    const profilField = form.querySelector('select[name="profil"]');
    const structureRow = form.querySelector('#devis-structure-row');
    const structureField = form.querySelector('#devis-nom-structure');

    function updateStructureField() {
        const profil = profilField?.value;
        const isEntreprise = profil === 'Entreprise';
        const isAssociation = profil === 'Association';
        const visible = isEntreprise || isAssociation;
        if (!structureRow || !structureField) return;
        structureRow.hidden = !visible;
        structureRow.style.display = visible ? '' : 'none';
        structureField.disabled = !visible;
        structureField.required = visible;
        structureField.placeholder = isAssociation ? 'NOM DE L’ASSOCIATION' : 'NOM DE L’ENTREPRISE';
        structureField.setAttribute('aria-label', isAssociation ? 'Nom de l’association' : 'Nom de l’entreprise');
        structureField.value = '';
    }

    profilField?.addEventListener('change', updateStructureField);
    updateStructureField();

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
        if (structureField?.required && !structureField.value.trim()) {
            errorBox.textContent = 'Veuillez renseigner le nom de votre structure.';
            errorBox.style.display = 'block';
            structureField.focus();
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
            ...(structureField && !structureField.disabled ? { nom_structure: structureField.value.trim() } : {}),
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
            updateStructureField();
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
