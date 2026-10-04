document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#devis-form");
    const errorMessage = document.querySelector(".form-error");
    const successMessage = document.querySelector(".form-success");

    if (!form) return;


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* ==========================
           VÉRIFICATION
        ========================== */

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


        /* ==========================
           ENVOI
        ========================== */

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


            /* ==========================
               SUCCÈS
            ========================== */

            if (data.success === true) {

                form.reset();


                if (successMessage) {

                    successMessage.textContent =
                        "Votre demande de devis a bien été envoyée. Nous reviendrons vers vous prochainement.";

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
                "La demande n'a pas pu être envoyée. Veuillez réessayer.";

            errorMessage.style.display = "block";

        }

    });

});