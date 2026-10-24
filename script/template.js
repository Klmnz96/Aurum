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

function buildProductThumb(imagePath) {
  return `
  <li>
  <button class="product-thumb" type="button" data-image="${getAssetPath(imagePath)}" aria-label="Show this view">
  <img src="${getAssetPath(imagePath)}" alt="" />
  </button>
  </li>
  `;
}

function buildDescriptionParagraph(paragraphText) {
  return `<p>${paragraphText}</p>`;
}

function buildProductDetail(product) {
  return `
  <div class="product-gallery">
  <figure class="product-main-image">
  <img src="${getAssetPath(product.images[0])}" alt="${product.name}" id="product-main-image" />
  </figure>
  <ul class="product-thumbs">
  ${getProductThumbsHtml(product.images)}
  </ul>
  </div>
  
  <div class="product-info">
  <h1 class="product-name">${product.name}</h1>
  <p class="product-price">${formatPrice(product.price)}</p>
  <p class="product-category">${product.category}, ${product.caseSize}</p>
  <p class="product-summary">${product.summary}</p>
  <button class="button product-add" type="button" data-id="${product.id}">Add to selection</button>
  <dl class="product-specs">
  <div><dt>Case</dt><dd>${product.caseSize}</dd></div>
  <div><dt>Material</dt><dd>${product.material}</dd></div>
  <div><dt>Movement</dt><dd>${product.movement}</dd></div>
  <div><dt>Water resistance</dt><dd>${product.waterResistance}</dd></div>
  </dl>
  <div class="product-description">
  ${getDescriptionHtml(product.description)}
  </div>
  </div>
  `;
}

function buildCartItem(cartEntry) {
  return `
  <li class="cart-item">
  <figure class="cart-item-media watch-frame" style="${getWatchFocusStyle(cartEntry.product.focus)}">
  <img src="${getAssetPath(cartEntry.product.thumb)}" alt="${cartEntry.product.name}" />
  </figure>
  <div class="cart-item-info">
  <h3 class="cart-item-name">${cartEntry.product.name}</h3>
  <p class="cart-item-meta">${cartEntry.product.category}, ${cartEntry.product.caseSize}</p>
  <button class="cart-item-remove" type="button" data-id="${cartEntry.product.id}">Remove</button>
  </div>
  <div class="cart-item-quantity">
  <button class="quantity-btn" type="button" data-action="decrease" data-id="${cartEntry.product.id}" aria-label="One less">
  <img src="${getAssetPath("assets/icons/minus.svg")}" alt="" width="16" height="16" />
  </button>
  <span>${cartEntry.quantity}</span>
  <button class="quantity-btn" type="button" data-action="increase" data-id="${cartEntry.product.id}" aria-label="One more">
  <img src="${getAssetPath("assets/icons/plus.svg")}" alt="" width="16" height="16" />
  </button>
  </div>
  <p class="cart-item-price">${formatPrice(cartEntry.lineTotal)}</p>
  </li>
  `;
}
