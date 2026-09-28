document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#contact-form");
    const errorMessage = document.querySelector(".form-error");
    const successMessage = document.querySelector(".form-success");

    form.addEventListener("submit", async (event) => {

        // BLOQUE IMMÉDIATEMENT LA REDIRECTION
        event.preventDefault();

        // Vérification des champs
        if (!form.checkValidity()) {

            errorMessage.textContent =
                "Veuillez remplir tous les champs et accepter la politique de confidentialité.";

            errorMessage.style.display = "block";

            if (successMessage) {
                successMessage.style.display = "none";
            }

            form.reportValidity();

            return;
        }

        errorMessage.style.display = "none";

        const formData = new FormData(form);

        try {

            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            const data = await response.json();

            console.log("Réponse Web3Forms :", data);

            // ON NE CONSIDÈRE L'ENVOI RÉUSSI
            // QUE SI WEB3FORMS LE CONFIRME
            if (data.success === true) {

                form.reset();

                if (successMessage) {
                    successMessage.textContent =
                        "Votre message a bien été envoyé. Nous reviendrons vers vous prochainement.";

                    successMessage.style.display = "block";
                }

            } else {

                throw new Error(
                    data.message || "Web3Forms a refusé l'envoi."
                );

            }

        } catch (error) {

            console.error("Erreur Web3Forms :", error);

            errorMessage.textContent =
                "Le message n'a pas pu être envoyé. Veuillez réessayer.";

            errorMessage.style.display = "block";

        }

    });

});