let zoom = false;
let lastClickTime = 0;

function addZoomEventToImages() {
    const imagens = document.querySelectorAll(".product .swiper__product-images .swiper-wrapper .swiper-slide .product__media img");
    const body = document.body;
    const suggestionClick = document.querySelector('.suggestion-click');

    imagens.forEach(imagem => {
        
        imagem.removeEventListener("click", handleImageClick);
        imagem.addEventListener("click", handleImageClick);

        const container = imagem.closest(".product__media");
        if (container) {
            container.removeEventListener('touchstart', handleTouchStart);
            container.addEventListener('touchstart', handleTouchStart);
        }
    });

    function handleImageClick(event) {
        const currentTime = performance.now();
        const imagem = event.target;
        const container = imagem.closest(".product__media");

        if (currentTime - lastClickTime <= 500) {
            if (zoom) {
                imagem.classList.remove("image__zoom");
                imagem.style.transformOrigin = '';
                body.classList.remove("no-scroll");
                swiper.allowTouchMove = true;
                suggestionClick.classList.remove('hide-suggestion');
            } else {
                imagem.classList.add("image__zoom");
                const rect = container.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                imagem.style.transformOrigin = `${x}px ${y}px`;
                body.classList.add("no-scroll");
                swiper.allowTouchMove = false;
                suggestionClick.classList.add('hide-suggestion'); 
            }
            zoom = !zoom;
        }

        lastClickTime = currentTime;
    }

    function handleTouchStart(e) {
        if (zoom) {
            const container = e.currentTarget;
            container.addEventListener('touchmove', handleTouchMove);
        }
    }

    function handleTouchMove(event) {
        const touch = event.touches[0];
        const container = event.currentTarget;
        const imagem = container.querySelector("img");
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        imagem.style.transformOrigin = `${x}px ${y}px`;
    }
}

addZoomEventToImages();

swiper.on('slideChange', () => {
    addZoomEventToImages();
});
