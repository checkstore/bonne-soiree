
window.updateCartDrawerUI = async function() {
  try {
    const response = await fetch('/?section_id=cart-drawer');
    
    if (!response.ok) {
      console.error('Erro ao buscar o carrinho:', response);
      return;
    }
    const newResponse = await response.text();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newResponse;
    
    const oldCartDrawer = document.querySelector('cart-drawer');
    if (oldCartDrawer) {
      oldCartDrawer.replaceWith(tempDiv.querySelector('cart-drawer'));
    }
  } catch (error) {
    console.error('Error', error);
  }
}

  document.addEventListener('DOMContentLoaded', function() {
    const openWishList = document.querySelector('a.swym-wishlist.header__icon');
    console.log(openWishList);
    openWishList.addEventListener('click', function() {
      setTimeout(function() {
        document.querySelectorAll('button.swym-add-to-cart-btn.swym-button.swym-button-1').forEach(function(button) {
          button.addEventListener('click', function() {
            setTimeout(async function() {
              await window.updateCartDrawerUI();
              window.dispatchEvent(new Event('openCartDrawer'));
            }, 700);
          });
        });
      }, 700);
    });
  }); 
