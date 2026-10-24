function buildProductCard(product) {
  return `
    <li class="product-card">
    <a href="${getPagePath(`product.html?id=${product.id}`)}">
    <figure class="product-card-media watch-frame" style="${getWatchFocusStyle(product.focus)}">
    <img src="${getAssetPath(product.thumb)}" alt="${product.name}" />
    </figure>
    <p class="product-card-category">${product.category}</p>
    <h3 class="product-card-name">${product.name}</h3>
    <p class="product-card-price">${formatPrice(product.price)}</p>
    </a>
    </li>
    `;
}

function buildReferenceButton(product) {
  return `
    <li>
    <button class="reference-button" type="button" data-id="${product.id}" aria-pressed="false">${product.name}</button>
    </li>
    `;
}

function buildReferenceDetail(product) {
  return `
    <p class="reference-category">${product.category}</p>
    <p class="reference-price">${formatPrice(product.price)}</p>
    <ul class="reference-specs">
    <li>${product.caseSize}, ${product.material}</li>
    <li>${product.movement}</li>
    <li>Water resistant to ${product.waterResistance}</li>
    </ul>
    <p class="reference-summary">${product.summary}</p>
    <a href="${getPagePath(`product.html?id=${product.id}`)}" class="link-arrow">View the ${product.name}</a>
    `;
}

function buildProductNotFound() {
  return `
  <div class="product-not-found">
  <h1>This piece doesn't exist</h1>
  <p>The link may be outdated. All five references are in the collection.</p>
  <a href="collection.html" class="button">View the collection</a>
  </div>
  `;
}
