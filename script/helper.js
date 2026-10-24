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
