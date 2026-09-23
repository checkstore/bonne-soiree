document.addEventListener("DOMContentLoaded", function() {  

  let recentlyViewedProducts = JSON.parse(localStorage.getItem('recentlyViewedProducts')) || [];

  let productListContainer = document.querySelector('.listViewedProducts');

  let productList = document.createElement('ul');
  productList.classList.add('recentlyViewedProducts');

  recentlyViewedProducts.forEach(function(product) {

    let listItem = document.createElement('li');
    let productLink = document.createElement('a');
    let productImage = document.createElement('img');
    let collectionName = document.createElement('span');
    let productName = document.createElement('a');
    let priceContainer = document.createElement('div');
    let price = document.createElement('span');
    let compareAtPrice = document.createElement('span');

    productLink.href = product.url;
    productImage.src = product.image;
    productImage.alt = product.name;
    collectionName.textContent = product.collection;
    productName.href = product.url;
    productName.textContent = product.name;

    // Verifica se o preço de comparação é diferente do preço
    if (product.compare_at_price !== product.price) {
      compareAtPrice.textContent = product.compare_at_price;
      price.textContent = product.price;
    } else {
      // Se forem iguais, define apenas o preço
      price.textContent = product.price;
    }

    productLink.classList.add('product-link');
    collectionName.classList.add('collectionName');
    productName.classList.add('product-name');
    priceContainer.classList.add('prices');
    price.classList.add('price');
    compareAtPrice.classList.add('compare_at_price');

    productLink.appendChild(productImage);
    listItem.appendChild(productLink);
    listItem.appendChild(collectionName);
    listItem.appendChild(productName);
    // Verifica se o preço de comparação é diferente antes de adicionar
    if (compareAtPrice.textContent) {
      priceContainer.appendChild(compareAtPrice);
    }
    priceContainer.appendChild(price);
    listItem.appendChild(priceContainer);
    productList.appendChild(listItem);
  });

  // Adiciona a lista de produtos ao contêiner
  productListContainer.appendChild(productList);

});
