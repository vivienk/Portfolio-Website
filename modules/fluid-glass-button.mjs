// Adds a click ripple to the Say Hi and Download Resume glass buttons,
// complementing the "liquid glass button" CSS recipe (animated
// conic-gradient outline + diagonal light sweep) that lives in
// index.html's light-theme override block. The ripple is the one part
// of that look that needs JS rather than pure CSS — everything else is
// driven entirely by :hover/:active in that stylesheet.
const SAY_HI_SELECTOR = '.framer-tque6g a';
const DOWNLOAD_SELECTOR = 'a[download][title="Download File"]';
const SURFACE_SELECTOR = '.framer-1l7inir';

function enhance(link) {
  if (link.dataset.fluidGlass) return;
  link.dataset.fluidGlass = '1';
  const surface = link.querySelector(SURFACE_SELECTOR) || link;
  surface.classList.add('fluid-glass-surface');

  link.addEventListener('pointerdown', event => {
    const rect = surface.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const size = Math.max(rect.width, rect.height) * 1.8;
    const ripple = document.createElement('span');
    ripple.className = 'fluid-glass-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    surface.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

function ensureEnhanced() {
  document.querySelectorAll(`${SAY_HI_SELECTOR}, ${DOWNLOAD_SELECTOR}`).forEach(enhance);
}

new MutationObserver(ensureEnhanced).observe(document.documentElement, { childList: true, subtree: true });
ensureEnhanced();
