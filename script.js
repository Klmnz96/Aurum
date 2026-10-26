let allProducts = [];
let lastRemovedEntry = null;
let removalNoticeTimer;

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
  document.querySelector("#collection-heading").textContent =
    getCollectionHeading(category, filteredProducts.length);

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });
  clickedButton.classList.add("is-active");
  clickedButton.setAttribute("aria-pressed", "true");
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
      document.title = "Piece not found - Aurum";
      return;
    }
    productContainer.innerHTML = buildProductDetail(selectedProduct);
    document.title = `${selectedProduct.name} - Aurum`;
    setActiveThumb(productContainer.querySelector(".product-thumb"));
    setAddButtonState(
      productContainer.querySelector(".product-add"),
      isInCart(selectedProduct.id),
    );
  });

  productContainer.addEventListener("click", handleThumbClick);
  productContainer.addEventListener("click", handleAddToCartClick);
}

// Der Button zeigt dauerhaft, ob die Uhr schon in der Auswahl ist (auch nach dem Neuladen)
function setAddButtonState(addButton, isSelected) {
  addButton.textContent = isSelected ? "In your selection" : "Add to selection";
  addButton.setAttribute("aria-pressed", isSelected);
}

function handleAddToCartClick(event) {
  const addButton = event.target.closest(".product-add");
  if (!addButton) return;

  const wasAdded = addToCart(addButton.dataset.id);
  updateCartCount();
  setAddButtonState(addButton, true);

  const productName = document.querySelector(".product-name").textContent;
  document.querySelector("#product-status").textContent = wasAdded
    ? `${productName} added to your selection.`
    : `${productName} is already in your selection.`;
}

function getProductThumbsHtml(images) {
  return images
    .map((imagePath, imageIndex) =>
      buildProductThumb(imagePath, `View ${imageIndex + 1} of ${images.length}`),
    )
    .join("");
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
  mainImage.alt = `${mainImage.dataset.productName}, ${clickedThumb.getAttribute("aria-label").toLowerCase()}`;
  setActiveThumb(clickedThumb);
}

function renderCartPage(products) {
  const cartList = document.querySelector("#cart-items");
  const cartEmpty = document.querySelector("#cart-empty");
  const checkoutButton = document.querySelector("#checkout-btn");
  const cartEntries = getCartEntries(products);

  cartList.innerHTML = cartEntries.map(buildCartItem).join("");
  cartEmpty.hidden = cartEntries.length > 0;
  checkoutButton.disabled = cartEntries.length === 0;
  document.querySelector(".cart-summary").hidden = cartEntries.length === 0;
  document.querySelector("#cart-piece-count").textContent = cartEntries.length;
  document.querySelector("#cart-total").textContent = formatPrice(
    getCartTotal(cartEntries),
  );

  updateCartCount();
}

function showRemovalNotice(productName) {
  const cartStatus = document.querySelector("#cart-status");
  cartStatus.innerHTML = buildRemovalNotice(productName);

  // nach ein paar Sekunden ist das Entfernen endgültig
  clearTimeout(removalNoticeTimer);
  removalNoticeTimer = setTimeout(() => {
    cartStatus.textContent = "";
    lastRemovedEntry = null;
  }, 6000);
}

// Fokus bleibt in der Liste: nächster "Remove"-Button, sonst die Überschrift
function focusAfterRemoval(removedIndex) {
  const removeButtons = document.querySelectorAll(".cart-item-remove");
  const nextButton =
    removeButtons[removedIndex] || removeButtons[removeButtons.length - 1];
  (nextButton || document.querySelector("#selection-title")).focus();
}

function handleCartClick(event) {
  const removeButton = event.target.closest(".cart-item-remove");
  if (!removeButton) return;

  const removedProduct = allProducts.find(
    (product) => product.id === removeButton.dataset.id,
  );
  lastRemovedEntry = removeFromCart(removeButton.dataset.id);
  if (!lastRemovedEntry) return;

  renderCartPage(allProducts);
  showRemovalNotice(removedProduct.name);
  focusAfterRemoval(lastRemovedEntry.index);
}

function handleUndoClick(event) {
  if (!event.target.closest(".cart-undo") || !lastRemovedEntry) return;

  restoreToCart(lastRemovedEntry);
  const restoredId = lastRemovedEntry.item.id;
  lastRemovedEntry = null;
  clearTimeout(removalNoticeTimer);

  renderCartPage(allProducts);
  document.querySelector("#cart-status").textContent = "Restored.";
  document
    .querySelector(`.cart-item-remove[data-id="${restoredId}"]`)
    .focus();
}

function initCartPage() {
  const cartList = document.querySelector("#cart-items");
  if (!cartList) return;

  getProducts().then((products) => {
    allProducts = products;
    renderCartPage(allProducts);
  });

  cartList.addEventListener("click", handleCartClick);
  document
    .querySelector("#cart-status")
    .addEventListener("click", handleUndoClick);
  document
    .querySelectorAll(".book-viewing-btn")
    .forEach((bookButton) =>
      bookButton.addEventListener("click", handleBookViewingClick),
    );
}

function showFormMessage(form, messageText) {
  const existingMessage = form.querySelector(".form-message");
  if (existingMessage) existingMessage.remove();

  form.insertAdjacentHTML("beforeend", buildFormMessage(messageText));
  form.reset();
}

function handleNewsletterSubmit(event) {
  event.preventDefault();
  if (!validateForm(event.currentTarget)) return;
  showFormMessage(
    event.currentTarget,
    "Thank you. You'll hear from us when a new piece is ready.",
  );
}

function getRequestedPiecesText(contactForm) {
  const pieceNames = contactForm.dataset.pieceNames
    ? contactForm.dataset.pieceNames.split(",")
    : [];
  const referenceSelect = contactForm.querySelector("#reference-select");

  if (!pieceNames.length && referenceSelect.value) {
    pieceNames.push(referenceSelect.selectedOptions[0].textContent);
  }

  return pieceNames.length
    ? `For the ${formatNameList(pieceNames)}`
    : "For a first look at the collection";
}

// Statt einer kleinen Danke-Zeile ersetzt eine Zusammenfassung das Formular
function handleContactSubmit(event) {
  event.preventDefault();
  const contactForm = event.currentTarget;
  if (!validateForm(contactForm)) return;
  const dateValue = contactForm.querySelector("#viewing-date").value;

  const confirmationDetails = {
    piecesText: getRequestedPiecesText(contactForm),
    dateText: dateValue ? formatViewingDate(dateValue) : "on a day that suits you",
    emailAddress: escapeHtml(contactForm.querySelector("[name=email]").value.trim()),
  };

  contactForm.outerHTML = buildViewingConfirmation(confirmationDetails);
  document.querySelector("#request").focus();
}

// Kein echter Checkout: die Auswahl geht als Besichtigungs-Anfrage an die Kontaktseite
function handleBookViewingClick() {
  window.location.href = getViewingUrl(getSelectedIds(), true);
}

// Text unter dem Feld, im Ton der Seite statt in der Sprache des Browsers
function getFieldErrorMessage(formField) {
  const fieldValidity = formField.validity;
  if (fieldValidity.valid) return "";
  if (fieldValidity.customError) return formField.validationMessage;

  const fieldMessages = {
    name: "Please tell us your name.",
    email: fieldValidity.valueMissing
      ? "We'll need an email to confirm your time."
      : "That email doesn't look complete, for example name@example.com.",
    date: "Please choose a day from today onwards.",
  };
  return fieldMessages[formField.name || formField.type] || "Please check this field.";
}

function showFieldError(formField) {
  const errorId = `${formField.name || formField.type}-${formField.form.className}-error`;
  const errorMessage = getFieldErrorMessage(formField);
  let fieldError = document.getElementById(errorId);
  if (!fieldError && !errorMessage) return;

  if (!fieldError) {
    fieldError = document.createElement("p");
    fieldError.className = "field-error";
    fieldError.id = errorId;
    (formField.closest("label") || formField.form).append(fieldError);
    formField.setAttribute("aria-describedby", errorId);
  }

  fieldError.textContent = errorMessage;
  formField.setAttribute("aria-invalid", errorMessage ? "true" : "false");
}

// Gibt true zurück, wenn alles passt; sonst Meldungen zeigen und zum ersten Fehler springen
function validateForm(form) {
  const formFields = [...form.querySelectorAll("input, select, textarea")];
  formFields.forEach(showFieldError);

  const firstInvalidField = formFields.find((formField) => !formField.validity.valid);
  if (firstInvalidField) firstInvalidField.focus();
  return !firstInvalidField;
}

// Sobald ein Fehler angezeigt wird, verschwindet er beim Korrigieren live
function handleFieldInput(event) {
  const formField = event.target;
  if (formField.getAttribute("aria-invalid") === "true") showFieldError(formField);
}

function handleViewingDateInput(event) {
  const dateField = event.currentTarget;
  const validityMessage = isSunday(dateField.value)
    ? "The boutique is closed on Sundays. Please choose another day."
    : "";
  dateField.setCustomValidity(validityMessage);
}

// Der Link endet auf #request: erst springen, wenn das Formular fertig aufgebaut ist,
// sonst landet man durch nachladende Inhalte an der falschen Stelle
function scrollToRequestForm() {
  if (window.location.hash !== "#request") return;
  document
    .querySelector("#request")
    .scrollIntoView({ block: "start", behavior: "instant" });
}

// Von der Auswahl-Seite: "Your selection" + Link zur Auswahl.
// Von einer Produktseite: "Requested piece" + Link zurück zur Uhr.
function setSelectionStripSource(selectedProducts) {
  const selectionHeading = document.querySelector("#selection-heading");
  const selectionLink = document.querySelector("#selection-link");

  if (isRequestFromSelection()) {
    selectionHeading.textContent = "Your selection";
    selectionLink.textContent = "Change selection";
    selectionLink.href = "cart.html";
    return;
  }

  const firstProduct = selectedProducts[0];
  selectionHeading.textContent =
    selectedProducts.length === 1 ? "Requested piece" : "Requested pieces";
  selectionLink.textContent = `Back to the ${firstProduct.name}`;
  selectionLink.href = `product.html?id=${firstProduct.id}`;
}

// Kommt man mit einer Auswahl, zeigt das Formular die Uhren als Liste mit Bild
// und blendet die Einzelauswahl aus
function prefillViewingForm(referenceIds) {
  const contactForm = document.querySelector(".contact-form");
  const selectionStrip = document.querySelector("#selection-strip");
  const referenceField = document.querySelector("#reference-field");

  getProducts().then((products) => {
    const selectedProducts = getProductsByIds(products, referenceIds);
    if (!selectedProducts.length) {
      scrollToRequestForm();
      return;
    }

    document.querySelector("#selection-pieces").innerHTML = selectedProducts
      .map(buildSelectionPiece)
      .join("");
    setSelectionStripSource(selectedProducts);
    contactForm.dataset.pieceNames = selectedProducts
      .map((product) => product.name)
      .join(",");
    selectionStrip.hidden = false;
    referenceField.hidden = true;
    scrollToRequestForm();
  });
}

function initViewingForm() {
  const dateField = document.querySelector("#viewing-date");
  if (!dateField) return;

  dateField.min = getTodayDateValue();
  dateField.addEventListener("input", handleViewingDateInput);
  prefillViewingForm(getReferenceIdsFromUrl());
}

function initForms() {
  const newsletterForm = document.querySelector(".newsletter-form");
  const contactForm = document.querySelector(".contact-form");

  // Mit JS prüfen wir selbst (eigene Meldungen); ohne JS bleibt die Browser-Prüfung
  if (newsletterForm) {
    newsletterForm.noValidate = true;
    newsletterForm.addEventListener("submit", handleNewsletterSubmit);
    newsletterForm.addEventListener("input", handleFieldInput);
  }
  if (contactForm) {
    contactForm.noValidate = true;
    contactForm.addEventListener("submit", handleContactSubmit);
    contactForm.addEventListener("input", handleFieldInput);
  }
}

function initDriftReadout() {
  const driftSeconds = document.querySelector("#drift-seconds");
  if (!driftSeconds) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let driftTimer;

  const updateDriftReadout = () => {
    driftSeconds.textContent = getAllowedDriftSoFar().toFixed(6);
  };

  // nur ticken, solange die Zahl im Bild ist (spart Rechenzeit)
  const driftObserver = new IntersectionObserver(([entry]) => {
    clearInterval(driftTimer);
    if (!entry.isIntersecting) return;
    updateDriftReadout();
    driftTimer = setInterval(updateDriftReadout, prefersReducedMotion ? 1000 : 50);
  });

  updateDriftReadout();
  driftObserver.observe(driftSeconds);
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
  initForms();
  initViewingForm();
  initDriftReadout();
}

init();
