// Approximates the look of framer.com/marketplace/components/fluid-glass-button
// on the Say Hi CTA: a cursor-tracked specular highlight that drifts across
// the glass surface, plus a click ripple. That reference component is a
// React Three Fiber / WebGL shader (real-time fluid distortion, particle
// motion) — a full shader rebuild is out of scope for what's otherwise a
// plain-DOM site with no WebGL dependency beyond the hero's p5 sketch, so
// this reproduces its two most legible signatures in CSS + vanilla JS:
// the glass surface reacting to the pointer, and a ripple on click. The
// static frosted-glass fill/blur/shadow themselves live in index.html's
// light-theme override block, same as every other glass surface on the
// site — this module only adds the interactive layer on top.
const SELECTOR = '.framer-tque6g a';
const SURFACE_SELECTOR = '.framer-1l7inir';

function enhance(link) {
  if (link.dataset.fluidGlass) return;
  link.dataset.fluidGlass = '1';
  const surface = link.querySelector(SURFACE_SELECTOR) || link;
  surface.classList.add('fluid-glass-surface');

  link.addEventListener('pointermove', event => {
    const rect = surface.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const mx = ((event.clientX - rect.left) / rect.width) * 100;
    const my = ((event.clientY - rect.top) / rect.height) * 100;
    surface.style.setProperty('--mx', `${mx}%`);
    surface.style.setProperty('--my', `${my}%`);
  });

  link.addEventListener('pointerleave', () => {
    surface.style.setProperty('--mx', '50%');
    surface.style.setProperty('--my', '50%');
  });

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
  document.querySelectorAll(SELECTOR).forEach(enhance);
}

new MutationObserver(ensureEnhanced).observe(document.documentElement, { childList: true, subtree: true });
ensureEnhanced();
