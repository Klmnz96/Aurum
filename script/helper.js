function isInSubfolder() {
  return window.location.pathname.includes("/html/");
}

function getAssetPath(path) {
  return isInSubfolder() ? `../${path}` : path;
}

function getPagePath(fileName) {
  return isInSubfolder() ? fileName : `html/${fileName}`;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
