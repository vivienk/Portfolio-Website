// Mounts <hero-p5-sketch> into the hero background's mount point at
// runtime, same self-healing pattern as progressive-smear-carousel-init.mjs
// (see that file for why): re-query fresh on every DOM mutation and append
// whenever missing, rather than caching a reference and mounting once.
const HOST_SELECTOR = '.hero-p5-mount';

let pending = false;

function ensureMounted() {
  pending = false;
  const host = document.querySelector(HOST_SELECTOR);
  // Checked document-wide, not just inside the mount point: in light
  // theme, hero-p5-sketch.mjs reparents the element out to <body> as a
  // fixed full-page background (see its applyLayout()), which would
  // otherwise look like a missing mount to this observer and cause it to
  // create a second, duplicate instance inside the now-empty host.
  if (!host || document.querySelector('hero-p5-sketch')) return;
  host.appendChild(document.createElement('hero-p5-sketch'));
}

function isMounted() {
  return !!document.querySelector('hero-p5-sketch');
}

function schedule() {
  if (pending) return;
  pending = true;
  setTimeout(ensureMounted, 0);
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
schedule();
let attempts = 0;
const poll = setInterval(() => {
  ensureMounted();
  if (isMounted() || ++attempts > 20) clearInterval(poll);
}, 500);
