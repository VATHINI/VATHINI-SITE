document.addEventListener("DOMContentLoaded", () => {

    console.log("VATHINI JS chargé");


    const body = document.body;
    const intro = document.querySelector('.intro');
    const home = document.querySelector('.home');
    const cta = document.querySelector('.cta-project');


    let introFinished = false;


    const introPlayed = sessionStorage.getItem("introPlayed");



    // ==========================
    // CTA SLICES OBSERVER
    // ==========================

    let observer;


    if(cta){

        observer = new IntersectionObserver((entries)=>{


            entries.forEach(entry=>{


                if(entry.isIntersecting && introFinished){


                    cta.classList.add("active");

                    observer.unobserve(entry.target);


                }


            });


        },
        {
            threshold:.3
        });


    }



    // ==========================
    // INTRO DÉJÀ JOUÉE
    // ==========================


    if (introPlayed) {


        body.classList.remove("lock-scroll");


        intro.style.display = "none";

        home.classList.add("show");


        introFinished = true;


        if(cta){

            observer.observe(cta);

        }


        return;

    }



    // ==========================
    // PREMIÈRE VISITE
    // ==========================


    sessionStorage.setItem("introPlayed", "true");


    window.scrollTo(0, 0);


    body.classList.add("lock-scroll");



    setTimeout(() => {

        body.classList.remove("lock-scroll");

    }, 4000);




    setTimeout(() => {

        document.querySelector('.word-3').classList.add('hide');

    }, 3400);



    setTimeout(() => {

        document.querySelector('.word-2').classList.add('hide');

    }, 3800);



    setTimeout(() => {

        document.querySelector('.word-1').classList.add('hide');

    }, 4200);



    setTimeout(() => {

        intro.classList.add('fade-out');

    }, 4500);




    // FIN RÉELLE DE L'INTRO

    setTimeout(() => {


        intro.style.display = 'none';

        home.classList.add('show');


        introFinished = true;



        if(cta){

            observer.observe(cta);

        }


    }, 5200);



});