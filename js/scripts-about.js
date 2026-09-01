const cards = document.querySelectorAll('.animated-card');

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add('active');
            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.4
});

cards.forEach(card => observer.observe(card));