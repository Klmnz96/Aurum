const cartStorageKey = "aurumCart";

function getCart() {
  const savedCart = localStorage.getItem(cartStorageKey);
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cartItems) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
}

// Jede Uhr ist entweder in der Auswahl oder nicht (keine Mengen bei einer Besichtigung).
// Gibt zurück, ob die Uhr neu dazugekommen ist.
function addToCart(productId) {
  const cartItems = getCart();
  const isAlreadySelected = cartItems.some(
    (cartItem) => cartItem.id === productId,
  );
  if (isAlreadySelected) return false;

  cartItems.push({ id: productId });
  saveCart(cartItems);
  return true;
}

function getCartCount(cartItems) {
  return cartItems.length;
}

function updateCartCount() {
  const cartCount = document.querySelector("#cart-count");
  if (!cartCount) return;

  cartCount.textContent = getCartCount(getCart());
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
      return { product: product };
    })
    .filter((cartEntry) => cartEntry.product);
}

function getCartTotal(cartEntries) {
  return cartEntries.reduce(
    (totalPrice, cartEntry) => totalPrice + cartEntry.product.price,
    0,
  );
}

function getSelectedIds() {
  return getCart().map((cartItem) => cartItem.id);
}
