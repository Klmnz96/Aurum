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

function init() {
  initHeader();
  initScrollReveal();
}

init();
