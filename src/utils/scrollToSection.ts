/**
 * Scrolls smoothly to an in-page section instead of the browser's default
 * instant jump for `<a href="#section">` links. Shared so any in-page
 * anchor (footer, navbar, etc.) gets the same animated behavior instead of
 * each place reimplementing its own scroll handler.
 */
export function scrollToSection(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
