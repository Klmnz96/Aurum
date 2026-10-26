function isInSubfolder() {
  return window.location.pathname.includes("/html/");
}

function getAssetPath(path) {
  return isInSubfolder() ? `../${path}` : path;
}

function getPagePath(fileName) {
  return isInSubfolder() ? fileName : `html/${fileName}`;
}

// Position der Uhr im Bild -> CSS-Variablen, damit jede Uhr gleich groß und mittig sitzt
function getWatchFocusStyle(focus) {
  return `--focus-x: ${focus.x}; --focus-y: ${focus.y}; --case-size: ${focus.caseSize};`;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

// Aktuelle Uhrzeit in Genf als { weekday: "Mon", minutes: 994, label: "16:34" }
function getGenevaTime() {
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const weekday = timeParts.find((part) => part.type === "weekday").value;
  const hour = timeParts.find((part) => part.type === "hour").value;
  const minute = timeParts.find((part) => part.type === "minute").value;

  return {
    weekday: weekday,
    minutes: Number(hour) * 60 + Number(minute),
    label: `${hour}:${minute}`,
  };
}

function timeToMinutes(timeText) {
  const [hour, minute] = timeText.split(":");
  return Number(hour) * 60 + Number(minute);
}

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Überschrift der Kollektion passend zum gewählten Filter
function getCollectionHeading(category, productCount) {
  if (category === "all") return "All five references";
  const referenceWord = productCount === 1 ? "reference" : "references";
  return `${category}, ${productCount} ${referenceWord}`;
}

// ?reference=meridian,calibre -> ["meridian", "calibre"]
function getReferenceIdsFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const referenceParam = urlParams.get("reference");
  return referenceParam ? referenceParam.split(",") : [];
}

// ["Meridian", "Calibre"] -> "Meridian and Calibre"
function formatNameList(names) {
  return new Intl.ListFormat("en", { type: "conjunction" }).format(names);
}

// Heutiges Datum im Format des Datumsfelds (YYYY-MM-DD, lokale Zeit)
function getTodayDateValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function isSunday(dateValue) {
  return new Date(`${dateValue}T12:00`).getDay() === 0;
}

// Link zur Besichtigungs-Anfrage, springt direkt zum Formular
function getViewingUrl(productIds, isFromSelection = false) {
  const referenceQuery = productIds.length
    ? `?reference=${productIds.join(",")}`
    : "";
  const sourceQuery = isFromSelection ? "&from=selection" : "";
  return getPagePath(`contact.html${referenceQuery}${sourceQuery}#request`);
}

function isRequestFromSelection() {
  return new URLSearchParams(window.location.search).get("from") === "selection";
}

// Produkte in der Reihenfolge der ids (unbekannte ids fallen weg)
function getProductsByIds(products, productIds) {
  return productIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product) => product);
}

// "2026-11-03" -> "Tuesday 3 November"
function formatViewingDate(dateValue) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateValue}T12:00`));
}

// Nutzereingaben sicher in HTML einsetzen
function escapeHtml(text) {
  const textHolder = document.createElement("div");
  textHolder.textContent = text;
  return textHolder.innerHTML;
}

// Sekunden seit Mitternacht in Genf, mit Millisekunden
function getSecondsSinceGenevaMidnight() {
  const now = new Date();
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const getPart = (partType) =>
    Number(timeParts.find((part) => part.type === partType).value);

  return (
    getPart("hour") * 3600 +
    getPart("minute") * 60 +
    getPart("second") +
    now.getMilliseconds() / 1000
  );
}

// Höchstens 2 Sekunden Abweichung pro Tag -> anteilig seit Mitternacht
function getAllowedDriftSoFar() {
  const secondsPerDay = 86400;
  const maxDriftPerDay = 2;
  return (getSecondsSinceGenevaMidnight() / secondsPerDay) * maxDriftPerDay;
}
