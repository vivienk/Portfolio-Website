// Mounts <glass-navbar> once, directly on <body> — unlike hero-p5-sketch
// or the carousel, this isn't replacing a placeholder nested inside a
// Framer-managed subtree, so there's no specific mount point to wait for
// and no risk of React hydration discarding it out from under us. Still
// self-heals the same way as the rest of this project's custom elements,
// for consistency and in case something upstream ever clears <body>.
function ensureMounted() {
  if (document.querySelector('glass-navbar')) return;
  document.body.prepend(document.createElement('glass-navbar'));
}

new MutationObserver(ensureMounted).observe(document.documentElement, { childList: true, subtree: true });
ensureMounted();
