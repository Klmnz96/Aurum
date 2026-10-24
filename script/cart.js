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

function changeQuantity(productId, quantityChange) {
  const cartItems = getCart();
  const changedItem = cartItems.find((cartItem) => cartItem.id === productId);
  changedItem.quantity += quantityChange;

  const remainingItems = cartItems.filter((cartItem) => cartItem.quantity > 0);
  saveCart(remainingItems);
}

function removeFromCart(productId) {
  const remainingItems = getCart().filter(
    (cartItem) => cartItem.id !== productId,
  );
  saveCart(remainingItems);
}

function getCartEntries(products) {
  return getCart()
    .map((cartItem) => {
      const product = products.find((product) => product.id === cartItem.id);
      return {
        product: product,
        quantity: cartItem.quantity,
        lineTotal: product ? product.price * cartItem.quantity : 0,
      };
    })
    .filter((cartEntry) => cartEntry.product);
}

function getCartTotal(cartEntries) {
  return cartEntries.reduce(
    (totalPrice, cartEntry) => totalPrice + cartEntry.lineTotal,
    0,
  );
}
