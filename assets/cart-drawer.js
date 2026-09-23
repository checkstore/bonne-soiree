class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
    this.setRelatedProducts();

    window.addEventListener('openCartDrawer', this.handleOpenCartDrawer.bind(this));
  }

  async setRelatedProducts() {
    async function fetchRelatedProducts(productId) {
      const response = await fetch(`/recommendations/products.json?product_id=${productId}&intent=related`);
      const data = await response.json();
      const relatedProducts = data.products;
      
      return relatedProducts.filter((product, index) => product.available);
    }
  
    const firstProduct = document.querySelector('.cart-items .cart-item:first-child');
    if (!firstProduct) {
      if (document.querySelector('.related_product_cart')) {
        document.querySelector('.related_products_cart').remove();
      }
      return;
    }
    
    const productId = firstProduct.getAttribute('data-product-id');
    const relatedProducts = await fetchRelatedProducts(productId);
    if (!relatedProducts.length) {
      if (document.querySelector('.related_product_cart')) {
        document.querySelector('.related_products_cart').remove();
      }
      return;
    }
    
    relatedProducts.map((product) => {
      const relatedProduct = document.createElement('div');
      relatedProduct.classList.add('related_product_cart__product');
      relatedProduct.innerHTML = `
        <div href="${product.url}" class="related_product_cart__product-link">
          <img src="${product.images[0]}" alt="${product.title}" class="related_product_cart__product-image">
          <div class="related_product_cart__product-info">
              <a href="${product.url}" class="related_product_cart__product-link-title related_product_cart__product-title">${product.title}</a>  
              <span class="related_product_cart__product-price">
                ${window.Shopify.currency.symbol}
                ${product.price / 100}
              </span>
              <div class="related_product_cart__product-info">
                <product-form data-section-id="template--22295391273261__product-grid"><form method="post" action="/cart/add" accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form"><input type="hidden" name="form_type" value="product">
                    <input type="hidden" name="utf8" value="✓">
                    <input type="hidden" name="id" value="${product.variants[0].id}" class="product-variant-id">
                    <button id="-submit" type="submit" name="add" class="quick-add__submit button--full-width button--secondary" aria-haspopup="dialog" aria-labelledby="-submit title-template--22295391273261__product-grid-${product.id}" aria-live="polite" data-sold-out-message="true">
                    <span>Adicionar</span>
                    <span class="sold-out-message hidden">Esgotado</span>
                    <link href="//theme-shakers-pro.myshopify.com/cdn/shop/t/7/assets/component-loading-spinner.css?v=116724955567955766481711483595" rel="stylesheet" type="text/css" media="all">
                    <div class="loading__spinner hidden">
                      <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                        <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                      </svg>
                    </div>
                    </button><input type="hidden" name="product-id" value="${product.id}"><input type="hidden" name="section-id" value="template--22295391273261__product-grid">
                </form></product-form>
              </div>
          </div>
        </div>
      `;
  
      let variants = product.variants.filter((variant) => variant.available);
      const selectVariant = document.createElement('select');
      selectVariant.name = 'id';
      selectVariant.classList.add('product-variant-id-select');
      selectVariant.setAttribute('aria-label', 'Selecione uma opção');
      selectVariant.setAttribute('data-variant-select', '');
      if (variants.length === 1) {
        selectVariant.style.display = 'none';
      }

      variants.map((variant) => {
        if (variant.available) {
          selectVariant.innerHTML += `<option value="${variant.id}">${variant.title}</option>`;
        }
      });

      const firstVariant = variants[0];
      relatedProduct.querySelector('.product-variant-id').value = firstVariant.id;

      relatedProduct.querySelector('.related_product_cart__product-price').insertAdjacentElement('afterend', selectVariant);
      document.querySelector('.related_products_cart__desktop .related_product_cart__products').appendChild(relatedProduct);
      const relatedProductMobile = relatedProduct.cloneNode(true);
      document.querySelector('.related_products_cart__mobile .related_product_cart__products').appendChild(relatedProductMobile);

      const selectVariantElement = relatedProduct.querySelector('[data-variant-select]');
      selectVariantElement.addEventListener('change', (event) => {
        const inputVariant = relatedProduct.querySelector('.product-variant-id');
        inputVariant.dispatchEvent(new Event('change'));
        inputVariant.setAttribute('value', event.target.value);
      });
    });
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  handleOpenCartDrawer(e) {
    const triggeredBy = e.details && e.details.triggeredBy;
    this.open(triggeredBy);
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden-cart');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden-cart');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    this.setRelatedProducts();

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
