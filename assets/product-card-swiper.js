document.addEventListener('DOMContentLoaded', function () {
  let swiperInstance;

  function handleSwiper() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile && !swiperInstance) {
      swiperInstance = new Swiper(".product-card-swiper", {
        loop: false,
        slidesPerView: 1,
        spaceBetween: 10,
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
        },
      });
    }
  }

  handleSwiper();
});
