function buildProductCard(product) {
  return `
    <li class="product-card">
    <a href="${getPagePath(`product.html?id=${product.id}`)}">
    <figure class="product-card-media">
    <img src="${getAssetPath(product.thumb)}" alt="${product.name}" />
    </figure>
    <p class="product-card-category">${product.category}</p>
    <h3 class="product-card-name">${product.name}</h3>
    <p class="product-card-price">${formatPrice(product.price)}</p>
    </a>
    </li>
    `;
}
