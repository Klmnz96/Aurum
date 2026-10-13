let cachedProducts;

function getProducts() {
  if (!cachedProducts) {
    const isInSubfolder = window.location.pathname.includes("/html/");
    const productsPath = isInSubfolder ? "../products.json" : "products.json";

    cachedProducts = fetch(productsPath)
      .then((response) => response.json())
      .then((data) => data.products);
  }

  return cachedProducts;
}
