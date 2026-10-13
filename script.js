let allProducts = [];

function initHeader() {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;

  // Unsichtbarer Marker kurz unterm Seitenanfang statt eines scroll-Events:
  // solange er sichtbar ist, sind wir "oben" -> Header bleibt transparent.
  const heroSentinel = document.createElement("div");
  heroSentinel.setAttribute("aria-hidden", "true");
  heroSentinel.style.cssText =
    "position:absolute;top:40px;left:0;width:1px;height:1px;";
  hero.prepend(heroSentinel);

  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-top", entry.isIntersecting);
  });

  headerObserver.observe(heroSentinel);
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
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

function init() {
  initHeader();
  initScrollReveal();
  initFeaturedGrid();
  initCollectionGrid();
}

init();
