let cachedProducts;

function getProducts() {
  if (!cachedProducts) {
    cachedProducts = fetch(getAssetPath("products.json"))
      .then((productsResponse) => productsResponse.json())
      .then((productsData) => productsData.products);
  }

  return cachedProducts;
}
