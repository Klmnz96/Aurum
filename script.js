let allProducts = [];

// Öffnungszeiten der Boutique (Genfer Ortszeit), Sonntag geschlossen
const boutiqueHours = {
  Mon: { open: "10:00", close: "18:30" },
  Tue: { open: "10:00", close: "18:30" },
  Wed: { open: "10:00", close: "18:30" },
  Thu: { open: "10:00", close: "18:30" },
  Fri: { open: "10:00", close: "18:30" },
  Sat: { open: "10:00", close: "17:00" },
  Sun: null,
};

const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weekdayNames = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function initHeader() {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero, .page-intro");
  if (!header || !hero) return;

  // Unsichtbarer Marker kurz unterm Seitenanfang statt eines scroll-Events:
  // solange er sichtbar ist, sind wir "oben" -> Header bleibt transparent.
  const heroSentinel = document.createElement("div");
  heroSentinel.setAttribute("aria-hidden", "true");
  heroSentinel.style.cssText =
    "position:absolute;top:40px;left:0;width:1px;height:1px;"; // taste-skill-ignore: unsichtbarer Marker, keine Linie
  hero.prepend(heroSentinel);

  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-top", entry.isIntersecting);
  });

  headerObserver.observe(heroSentinel);
}

function setMobileNav(isOpen) {
  const siteNav = document.querySelector("#site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const toggleIcon = navToggle.querySelector("img");

  siteNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);

  toggleIcon.src = getAssetPath(
    isOpen ? "assets/icons/close.svg" : "assets/icons/menu.svg",
  );
  toggleIcon.alt = isOpen ? "Close menu" : "Open menu";
}

function handleNavToggleClick(event) {
  const isOpen = event.currentTarget.getAttribute("aria-expanded") === "true";
  setMobileNav(!isOpen);
}

function handleNavLinkClick(event) {
  if (event.target.closest("a")) setMobileNav(false);
}

function handleNavKeyDown(event) {
  if (event.key === "Escape") setMobileNav(false);
}

function initMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  if (!navToggle || !siteNav) return;

  navToggle.addEventListener("click", handleNavToggleClick);
  siteNav.addEventListener("click", handleNavLinkClick);
  document.addEventListener("keydown", handleNavKeyDown);

  const desktopQuery = window.matchMedia("(min-width: 60rem)");
  desktopQuery.addEventListener("change", () => setMobileNav(false));
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    "[data-reveal], [data-disc]",
  );
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  // Elemente mit clip-path (der Kreis startet bei 0 %) meldet der Observer nie als
  // sichtbar -> stattdessen das Elternelement beobachten und das Kind einblenden
  const revealTargets = new Map();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealTargets.get(entry.target).classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
  );

  revealElements.forEach((element) => {
    const observedElement = element.hasAttribute("data-disc")
      ? element.parentElement
      : element;
    revealTargets.set(observedElement, element);
    revealObserver.observe(observedElement);
  });
}

function renderProductGrid(gridElement, products) {
  gridElement.innerHTML = products.map(buildProductCard).join("");
}

function initFeaturedGrid() {
  const featuredGrid = document.querySelector("#featured-grid");
  if (!featuredGrid) return;

  getProducts().then((products) => {
    renderProductGrid(featuredGrid, products.slice(0, 3));
  });
}

function handleFilterClick(event) {
  const clickedButton = event.target.closest(".filter-btn");
  if (!clickedButton) return;

  const productGrid = document.querySelector("#product-grid");
  const category = clickedButton.dataset.category;
  const filteredProducts =
    category === "all"
      ? allProducts
      : allProducts.filter((product) => product.category === category);

  renderProductGrid(productGrid, filteredProducts);

  document
    .querySelectorAll(".filter-btn")
    .forEach((button) => button.classList.remove("is-active"));
  clickedButton.classList.add("is-active");
}

function initCollectionGrid() {
  const productGrid = document.querySelector("#product-grid");
  const filterBar = document.querySelector(".filter-bar");
  if (!productGrid || !filterBar) return;

  getProducts().then((products) => {
    allProducts = products;
    renderProductGrid(productGrid, allProducts);
  });

  filterBar.addEventListener("click", handleFilterClick);
}

function showReference(product) {
  const referenceImage = document.querySelector("#reference-image");
  const referenceDetail = document.querySelector("#reference-detail");

  referenceImage.src = getAssetPath(product.thumb);
  referenceImage.alt = product.name;
  referenceImage.style.cssText = getWatchFocusStyle(product.focus);
  referenceDetail.innerHTML = buildReferenceDetail(product);

  document.querySelectorAll(".reference-button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.id === product.id);
  });

  // kurzes Überblenden beim Wechsel (300ms), nicht bei reduzierter Bewegung
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!prefersReducedMotion) {
    referenceImage.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: "ease",
    });
  }
}

function handleReferenceClick(event) {
  const clickedButton = event.target.closest(".reference-button");
  if (!clickedButton) return;

  const selectedProduct = allProducts.find(
    (product) => product.id === clickedButton.dataset.id,
  );
  showReference(selectedProduct);
}

function initShowcase() {
  const referenceList = document.querySelector("#reference-list");
  if (!referenceList) return;

  getProducts().then((products) => {
    allProducts = products;
    referenceList.innerHTML = products.map(buildReferenceButton).join("");
    showReference(products[0]);
  });

  referenceList.addEventListener("click", handleReferenceClick);
}

function findNextOpening(currentWeekday) {
  const currentIndex = weekdayOrder.indexOf(currentWeekday);

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const nextWeekday = weekdayOrder[(currentIndex + dayOffset) % 7];
    if (boutiqueHours[nextWeekday]) {
      const dayLabel = dayOffset === 1 ? "tomorrow" : weekdayNames[nextWeekday];
      return `${dayLabel} at ${boutiqueHours[nextWeekday].open}`;
    }
  }
}

function getBoutiqueStatusText(genevaTime) {
  const todaysHours = boutiqueHours[genevaTime.weekday];
  const timeSentence = `It is ${genevaTime.label} in Geneva.`;

  if (todaysHours && genevaTime.minutes < timeToMinutes(todaysHours.open)) {
    return `${timeSentence} The boutique opens today at ${todaysHours.open}.`;
  }

  if (todaysHours && genevaTime.minutes < timeToMinutes(todaysHours.close)) {
    return `${timeSentence} The boutique is open until ${todaysHours.close}.`;
  }

  return `${timeSentence} The boutique opens ${findNextOpening(genevaTime.weekday)}.`;
}

function initBoutiqueStatus() {
  const boutiqueStatus = document.querySelector("#boutique-status");
  if (!boutiqueStatus) return;

  const updateBoutiqueStatus = () => {
    boutiqueStatus.textContent = getBoutiqueStatusText(getGenevaTime());
  };

  updateBoutiqueStatus();
  setInterval(updateBoutiqueStatus, 30000);
}

function initProductDetail() {
  const productContainer = document.querySelector("#product");
  if (!productContainer) return;

  const productId = getProductIdFromUrl();

  getProducts().then((products) => {
    const selectedProduct = products.find(
      (product) => product.id === productId,
    );

    if (!selectedProduct) {
      productContainer.innerHTML = buildProductNotFound();
      return;
    }
    productContainer.innerHTML = buildProductDetail(selectedProduct);
    document.title = `${selectedProduct.name} - Aurum`;
    setActiveThumb(productContainer.querySelector(".product-thumb"));
  });

  productContainer.addEventListener("click", handleThumbClick);
  productContainer.addEventListener("click", handleAddToCartClick);
}

function handleAddToCartClick(event) {
  const addButton = event.target.closest(".product-add");
  if (!addButton) return;

  addToCart(addButton.dataset.id);
  updateCartCount();

  addButton.textContent = "Added to selection";
  setTimeout(() => {
    addButton.textContent = "Add to selection";
  }, 1500);
}

function getProductThumbsHtml(images) {
  return images.map(buildProductThumb).join("");
}

function getDescriptionHtml(paragraphs) {
  return paragraphs.map(buildDescriptionParagraph).join("");
}

function setActiveThumb(activeThumb) {
  document
    .querySelectorAll(".product-thumb")
    .forEach((thumb) => thumb.classList.remove("is-active"));
  activeThumb.classList.add("is-active");
}

function handleThumbClick(event) {
  const clickedThumb = event.target.closest(".product-thumb");
  if (!clickedThumb) return;

  const mainImage = document.querySelector("#product-main-image");
  mainImage.src = clickedThumb.dataset.image;
  setActiveThumb(clickedThumb);
}

function renderCartPage(products) {
  const cartList = document.querySelector("#cart-items");
  const cartEmpty = document.querySelector("#cart-empty");
  const checkoutButton = document.querySelector("#checkout-btn");
  const cartEntries = getCartEntries(products);
  const cartTotal = formatPrice(getCartTotal(cartEntries));

  cartList.innerHTML = cartEntries.map(buildCartItem).join("");
  cartEmpty.hidden = cartEntries.length > 0;
  checkoutButton.disabled = cartEntries.length === 0;
  document.querySelector("#cart-subtotal").textContent = cartTotal;
  document.querySelector("#cart-total").textContent = cartTotal;

  updateCartCount();
}

function handleCartClick(event) {
  const quantityButton = event.target.closest(".quantity-btn");
  const removeButton = event.target.closest(".cart-item-remove");

  if (quantityButton) {
    const quantityChange =
      quantityButton.dataset.action === "increase" ? 1 : -1;
    changeQuantity(quantityButton.dataset.id, quantityChange);
  } else if (removeButton) {
    removeFromCart(removeButton.dataset.id);
  } else {
    return;
  }

  renderCartPage(allProducts);
}

function initCartPage() {
  const cartList = document.querySelector("#cart-items");
  if (!cartList) return;

  getProducts().then((products) => {
    allProducts = products;
    renderCartPage(allProducts);
  });

  cartList.addEventListener("click", handleCartClick);
}

function init() {
  updateCartCount();
  initHeader();
  initMobileNav();
  initScrollReveal();
  initFeaturedGrid();
  initCollectionGrid();
  initShowcase();
  initBoutiqueStatus();
  initProductDetail();
  initCartPage();
}

init();
