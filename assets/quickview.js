document.addEventListener("DOMContentLoaded", function() {
    const quickAddButtons = document.querySelectorAll('.lnkQuickView');
    const overlayModal = document.querySelector('.overlay-moodal-desactive');
    const bgModal = document.querySelector('.bg-close-desactive');

    quickAddButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            html = document.querySelector('html');      
                  
            html.addEventListener('click', function(event) {
                const modalQuickView = document.querySelector('.modalQuickView');
                    if (event.target.closest('.modalQuickView') === null)  {
                        modalQuickView.innerHTML = '';

                        overlayModal.classList.remove('overlay-moodal');
                        overlayModal.classList.add('overlay-moodal-desactive');

                        bgModal.classList.remove('bg-close');
                        bgModal.classList.add('bg-close-desactive');

                        document.body.classList.remove('no-body-scroll');
                        modalQuickView.style.display = 'block';
                    }
            });
            
            const productUrl = button.getAttribute('href');

            fetch(productUrl)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const productContent = doc.querySelector('#MainContent').innerHTML;
                    
                    const modalQuickView = document.querySelector('.modalQuickView');
                    modalQuickView.innerHTML = productContent;

                    overlayModal.classList.add('overlay-moodal');
                    overlayModal.classList.remove('overlay-moodal-desactive');

                    bgModal.classList.remove('bg-close-desactive');
                    bgModal.classList.add('bg-close');

                    document.body.classList.add('no-body-scroll');
                    changeColor();
                    chooseVariant();
                    clickAddToCart();          
                })
                .catch(error => {
                    console.error('Error fetching product data:', error);
            }); 
        });
    });


    function chooseVariant () {
        const variantCard = document.querySelectorAll('.modalQuickView .variant_block .product-form__input label');
        
        variantCard.forEach(card => {        
            card.addEventListener('click', () => {
                variantCard.forEach(card => { 
                    card.classList.remove('active');
                });
                card.classList.add('active');
            });
        });
    };
    
    function clickAddToCart() {
        const addToCartButton = document.querySelector('.modalQuickView .product-form__buttons .product-form__submit');
        const modalQuickView = document.querySelector('.modalQuickView');
        const bgModal = document.querySelector('.bg-close');
    
        if (addToCartButton) {
            addToCartButton.addEventListener('click', () => {
                modalQuickView.style.display = 'none';
                bgModal.classList.remove('bg-close');           
                bgModal.classList.add('bg-close-desactive');       
            });
        }
    }
    

    function changeColor(){
        const colorVariants = document.querySelectorAll('.modalQuickView .color-variants__item a');
            colorVariants.forEach(buttonColor => {
                buttonColor.addEventListener('click', function(event) {
                    
                    event.preventDefault();
                    
                    const productUrl = buttonColor.getAttribute('href');
        
                    fetch(productUrl)
                        .then(response => response.text())
                        .then(html => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const productContent = doc.querySelector('#MainContent').innerHTML;
                            
                            const modalQuickView = document.querySelector('.modalQuickView');
                            modalQuickView.innerHTML = productContent;
                            changeColor();
                            chooseVariant();
                            
                        })
                        .catch(error => {
                            console.error('Error fetching product data:', error);
                        });
                });
            });
    }
});