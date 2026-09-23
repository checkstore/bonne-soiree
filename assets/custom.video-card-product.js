document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth >= 1024) {
        const cardMedia = document.querySelectorAll('.card__inner');
        cardMedia.forEach((media) => {
            media.addEventListener("mouseenter", () => {
               
                if (!media.querySelector('.product-card-video')) return;
                const video = media.querySelector('.product-card-video');
                video.play();
            });
            media.addEventListener("mouseleave", () => {
               
                if (!media.querySelector('.product-card-video')) return;
                const video = media.querySelector('.product-card-video');
                video.pause();
            });
        });
    }
});