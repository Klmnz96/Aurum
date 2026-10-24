const cartStorageKey = "aurumCart";

function getCart() {
  const savedCart = localStorage.getItem(cartStorageKey);
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cartItems) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
}

function addToCart(productId) {
  const cartItems = getCart();
  const existingItem = cartItems.find((cartItem) => cartItem.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.push({ id: productId, quantity: 1 });
  }
  saveCart(cartItems);
}

function getCartCount(cartItems) {
  return cartItems.reduce(
    (totalCount, cartItem) => totalCount + cartItem.quantity,
    0,
  );
}

function updateCartCount() {
  const cartCount = document.querySelector("#cart-count");
  if (!cartCount) return;

  cartCount.textContent = getCartCount(getCart());
}
