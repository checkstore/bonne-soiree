document.addEventListener('DOMContentLoaded', function() {

	function formatPrice(price) {
		const priceString = price.toString();
		const integerPart = priceString.slice(0, -2) || '0';
		const decimalPart = priceString.slice(-2).padStart(2, '0');
		const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		return `R$${formattedIntegerPart},${decimalPart}`;
	}
	
	function addActiveLookPin(activeSlideIndex){
		activeSlideIndex = activeSlideIndex + 1;
		const links = document.querySelectorAll('.lookbook-block a[data-order]');
		links.forEach(function(link) {
			const order = parseInt(link.getAttribute('data-order'));
			if (order === activeSlideIndex) {
				link.classList.add('animateActive');
			} else {
				link.classList.remove('animateActive');
			}
		});
	}
	
	
    
	// start slide shop the look
    const swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: false,
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },  
		on: {
			slideChange: function () {
			  var activeSlideIndex = this.activeIndex;
			  addActiveLookPin(activeSlideIndex);
			},
		  },
    });

    //move slide shop the look
    const lookbookLinks = document.querySelectorAll('.lookbook-block a');
	lookbookLinks.forEach(function(link) {
		link.addEventListener('click', function(event) {
			if(innerWidth < 979){
				document.querySelector('#shop-the-look_modal').style.display = "block";
			}
            event.preventDefault();
            const position = parseInt(this.getAttribute('data-order'));
            swiper.slideTo(position - 1);
        });
    });


	function updateVariantIds() {
		const variantContainers = document.querySelectorAll('.variants_container');
		variantContainers.forEach(container => {
			const handle = container.getAttribute('data-handle');
	
			const variantLists = container.querySelectorAll('.list-variants');
	
			variantLists.forEach(list => {
				const variantListItems = list.querySelectorAll('li');
	
				variantListItems.forEach(item => {
					item.addEventListener('click', () => {
						document.querySelector('.product-form__error-message-wrapper').setAttribute('hidden', '');
						variantListItems.forEach(li => {
							li.classList.remove('selected');
						});
	
						item.classList.add('selected');
	
						updateAddToCartVariantId(container, handle);
						checkSoldoutOptions(container, handle);
					});
				});
			});
	
			updateAddToCartVariantId(container, handle);
			checkSoldoutOptions(container, handle);
		});
	}
	
	
	// Call the function when the page is loaded
	window.addEventListener('load', updateVariantIds);
	
	
	//function update variants id
	function updateAddToCartVariantId(container, handle) {
		
		const selectedOptions = container.querySelectorAll('li.selected');
	
		if (selectedOptions.length === 0) return;
	
		const selectedValues = [];
		selectedOptions.forEach(option => {
			selectedValues.push(option.getAttribute('data-value'));
		});
	
		// API URL
		const apiUrl = `/products/${handle}.js`;
	
		// Fetch the product data
		fetch(apiUrl)
			.then(response => response.json())
			.then(data => {

				data.variants.forEach(variant => {
					// debugger
					if (selectedValues.every(value => {
						return variant.title.split(' / ').includes(value);
					})) {
						const parentContainer = container.closest('.swiper-slide');
						
						if (parentContainer) {
							const addButton = parentContainer.querySelector('.product-variant-id');
							if (addButton) {
								addButton.setAttribute('value', variant.id);
							}
							
							const priceElement = parentContainer.querySelector('.price');
							if (priceElement) {
								priceElement.innerText = formatPrice(variant.price);
							}
							
							const compareAtPriceElement = parentContainer.querySelector('.compare_at_price');
							if (variant.compare_at_price != null) {
								parentContainer.querySelector('.compare_at_price').style.display = "block";
								compareAtPriceElement.innerText = formatPrice(variant.compare_at_price);
							}else{
								parentContainer.querySelector('.compare_at_price').style.display = "none";
							}
						}
					}
									
				});
			})
			.catch(error => console.error('Error fetching product data:', error));
	}
	
	function checkSoldoutOptions(container, handle) {
		const selectedOption = container.querySelector('.list-variants li.selected');
		if (!selectedOption) return;
	
		const selectedValue = selectedOption.getAttribute('data-value');
	
		const variantLists = container.querySelectorAll('.list-variants');
	
		// If there's only one list of variants, check if any variants are sold out
		if (variantLists.length === 1) {
			fetch(`/products/${handle}.js`)
				.then(response => response.json())
				.then(data => {
					// Check each variant's availability
					data.variants.forEach(variant => {
						const option = container.querySelector(`.list-variants li[data-value="${variant.title}"]`);
						if (option) {
							if (!variant.available) {
								option.classList.add('soldout');
							} else {
								option.classList.remove('soldout');
							}
						}
					});
				})
				.catch(error => console.error('Error fetching product data:', error));
		} else {
			const colorOptions = container.querySelector('.list-variants + label + ul').querySelectorAll('li');
	
			// Fetch the product data from the API
			fetch(`/products/${handle}.js`)
				.then(response => response.json())
				.then(data => {

					colorOptions.forEach(option => {	
						const variant = data.variants.find(variant => variant.title.includes(selectedValue) && variant.title.includes(option.getAttribute('data-value')));
						if (variant) {
							// Add or remove 'soldout' class to/from the color option based on availability
							if (variant.available) {
								option.classList.remove('soldout');
							} else {
								option.classList.add('soldout');
							}
						}
					});
				})
				.catch(error => console.error('Error fetching product data:', error));
		}
	}
		
	// Call the function when the page is loaded
	window.addEventListener('load', updateVariantIds);

	document.querySelector(".btn_closemodal").addEventListener("click", function() {
		document.getElementById("shop-the-look_modal").style.display = "none";
		event.preventDefault();
	});
});