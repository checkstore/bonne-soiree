class CartRemoveButton extends HTMLElement {
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
                ${product.price / 100}</span>
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

  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
      this.setRelatedProducts();
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

function atualizarProgressBar() {
  fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
          const progressBar = document.getElementById("progress");
          const message = document.getElementById("message_progressbar");
          const freeShippingValue = freeShipping; 
          const currentAmount = cart.total_price / 100; 
          const amountLeft = freeShippingValue - currentAmount;
          const percentage = (currentAmount / freeShippingValue) * 100;

          progressBar.style.width = `${percentage}%`;

          if (amountLeft > 0) {
              message.innerHTML = `Faltam <strong>R$ ${amountLeft.toFixed(2)}</strong> para ganhar <strong>Frete Grátis.</strong>`;
          } else {
              message.innerHTML = `Parabéns, você ganhou <strong>Frete Grátis!</strong>`;
          }
          window.showShippingCalculator();
          window.discountCodesFunction();
          window.ShippingCalculator.init();
      })
      .catch(error => {
          console.error('Erro:', error);
      });
}
window.addEventListener('DOMContentLoaded', () => {
  atualizarProgressBar();
});

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'), event.target.dataset.quantityVariantId);
  }

  onCartUpdate() {
    atualizarProgressBar();
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        atualizarProgressBar();
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);
        if (parsedState.item_count === 0) {
          // location.reload();
          document.querySelector('.page_cart > div').classList.add('width-100');
          // document.querySelector('.related-products').style.display = 'none';
        }

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').innerHTML = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}
