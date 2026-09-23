
function formatPrice(price) {
    const formatedPrice = price / 100;
    return 'R$ ' + formatedPrice.toFixed(2);
 }

document.addEventListener('DOMContentLoaded', function() {
  initRelatedProducts();
});

function initRelatedProducts() {
  const container = document.getElementById('related-products-container');
  const productId = container.getAttribute('data-product-id');
  if (productId) {
      loadRelatedProducts(productId);
  }
}

function loadRelatedProducts(productId) {
  const containerContent = document.querySelector('.related-products__content');
  fetch(window.Shopify.routes.root + `recommendations/products.json?product_id=${productId}&limit=3&intent=related`)
      .then(response => response.json())   
      .then(data => {
          let productHTML = '';
          data.products.forEach(product => {
              productHTML += buildProductHTML(product);
          });
          containerContent.innerHTML = productHTML;
          setupFunctionsProductsBlock();
      })
      .catch(handleError);
}


function setupFunctionsProductsBlock() {
  const selectVariants = document.querySelectorAll('.related-product-variants');
  selectVariants.forEach(selectVariant => {
    const addToCartButton = selectVariant.closest('.card__container').querySelector('.add-to-cart');

    addToCartButton.addEventListener('click', () => {
      adicionarAoCarrinho(addToCartButton.getAttribute('data-product-id'));
    });

    selectVariant.addEventListener('change', function (event) {
        const variantId = event.target.value;
        addToCartButton.setAttribute('data-product-id', variantId);
    });
  })
}


function buildProductHTML(product) {
  if (!product.available) return;

  let productOptions = '<select ' 
  if(product.variants.length == 1 && product.variants[0].title == 'Default Title'){
    productOptions += 'style="display: none" ';
  }

  productOptions += 'class="related-product-variants">';
  product.variants.forEach(variant => {
      if (variant.available) {
        productOptions += `<option value="${variant.id}" product-variant-id="${variant.id}" >${variant.title}</option>`;           
      }
    });

  productOptions += '</select>';

  return `
      <div class="related-product">
          <div class="card__container">
              <div class="main-card__container">
                  <img class="related-product__img" src="${product.featured_image}" alt="${product.title}">
                  <div class="main-card__info">
                      <p class="related-product-title">${product.title}</p>
                      <p class="related-product-price">${formatPrice(product.price)}</p>
                      ${productOptions}
                  </div>
              </div>
              <div class="related-product__info">
                  <button class="btn__see-product add-to-cart" data-product-id="${ product.variants.filter(variant => variant.available)[0].id }">Adicionar ao carrinho</button>
              </div>
          </div>
      </div>
  `;
}


function handleError(error) {
  console.error('Error Carregando related products:', error);
}

function updateCart() {
  if(window.location.pathname === '/cart'){
    fetch(window.Shopify.routes.root + 'cart')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
         
        // const content = doc.querySelector('#main-cart-items').innerHTML;
        // const cartToUpdate = document.querySelector('#main-cart-items');
        const content = doc.querySelector('#MainContent').innerHTML;
        const cartToUpdate = document.querySelector('#MainContent');
      
        cartToUpdate.innerHTML = content;
        initRelatedProducts();
    });
  }else{
    location.reload();
  }
}

function adicionarAoCarrinho(produtoId) {
  var dados = {
    items: [{
      id: produtoId,
      quantity: 1
    }]
  };
  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      console.error('Erro ao adicionar o produto ao carrinho');
    }
  })
  .then(cart =>{
    updateCart();
  })
  .catch(error => {
    console.error('Erro:', error);
  });
}