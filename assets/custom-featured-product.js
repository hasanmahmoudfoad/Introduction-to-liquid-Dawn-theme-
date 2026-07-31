
const button = document.querySelector('[data-add-to-cart]');
const variantInput = document.querySelector('[name="id"]');
const quantityInput = document.querySelector('[name="quantity"]');
const displayedPrice = document.querySelector('.product-price');
const slides = document.querySelectorAll('.product-media-swiper .swiper-slide');
const warrantySelector = document.querySelector('[data-warranty-selector]');

let selectedQuantity = Number(quantityInput.value);
quantityInput.addEventListener('change', () => {selectedQuantity = Number(quantityInput.value);
console.log('selectedQuantity:' , selectedQuantity);
});


let selectedVariantId = Number(variantInput.value);
variantInput.addEventListener('change', () => {
  const selectedOption = event.target.selectedOptions[0];
  const selectedPrice = selectedOption.getAttribute("data-price");
  const selectedMediaId = selectedOption.getAttribute("data-media-id");

  selectedVariantId = Number(variantInput.value);
  displayedPrice.innerHTML = selectedPrice;


  if (!selectedMediaId){
    window.productSlider.slideTo(0);
    return;
  }

  slides.forEach((slides, index)=>{
    const slideMediaId = slides.getAttribute("data-media-id");

    if(slideMediaId === selectedMediaId){
      window.productSlider.slideTo(index);
    }

  });
  
});

const originalProductPrice = displayedPrice.innerHTML;
if (warrantySelector) {
  warrantySelector.addEventListener('change', (event) => {
    const selectedOption = event.target.selectedOptions[0];
    const warrantyPrice = selectedOption.getAttribute('data-price');

    if (!warrantyPrice) {
      displayedPrice.innerHTML = originalProductPrice;
      return;
    }

    displayedPrice.innerHTML = `${originalProductPrice} + ${warrantyPrice} warranty`;
  });
}


async function refreshCartDrawer() {
  const response = await fetch(`${window.Shopify.routes.root}?sections=cart-drawer,cart-icon-bubble`);
  const sections = await response.json();

  const cartDrawerHTML = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');

  const cartIconHTML = new DOMParser().parseFromString(sections['cart-icon-bubble'], 'text/html');

  const newCartDrawer = cartDrawerHTML.querySelector('#CartDrawer');
  const currentCartDrawer = document.querySelector('#CartDrawer');

  const newCartIcon = cartIconHTML.querySelector('#shopify-section-cart-icon-bubble');
  const currentCartIcon = document.querySelector('#cart-icon-bubble');

  if (newCartDrawer && currentCartDrawer) {
    currentCartDrawer.innerHTML = newCartDrawer.innerHTML;
  }

  if (newCartIcon && currentCartIcon) {
    currentCartIcon.innerHTML = newCartIcon.innerHTML;
  }

  const cartDrawer = document.querySelector('cart-drawer');

  if (cartDrawer) {
    cartDrawer.classList.remove('is-empty');
    cartDrawer.open?.();
  }

  console.log('Cart refreshed');
}


button.addEventListener('click', async () => {

  const variantId = Number(variantInput.value);
  const bundleContainsInput = document.querySelector('[data-bundle-contains]');
  const bundleContains = bundleContainsInput ? bundleContainsInput.value : '';
  const warrantyVariantId = warrantySelector ? Number(warrantySelector.value) : 0 ;

  const lineItem = {
    id: selectedVariantId,
    quantity: selectedQuantity
  };

  if (bundleContains) {
    lineItem.properties = {
      "_bundle_contains": bundleContains
    };
  }

  const lineItems = {
    items: [lineItem]
  };

  if (warrantyVariantId) {
    lineItems.items.push({
      id: warrantyVariantId,
      quantity: selectedQuantity,
      parent_id: selectedVariantId
    });
  }


  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lineItems)
  });

  const data = await response.json();

  console.log(data);
  await refreshCartDrawer();
});



   








