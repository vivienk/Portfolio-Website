// Mounts <hero-p5-sketch> into the hero background's mount point at
// runtime, same self-healing pattern as progressive-smear-carousel-init.mjs
// (see that file for why): re-query fresh on every DOM mutation and append
// whenever missing, rather than caching a reference and mounting once.
const HOST_SELECTOR = '.hero-p5-mount';

let pending = false;

function ensureMounted() {
  pending = false;
  const host = document.querySelector(HOST_SELECTOR);
  if (!host || host.querySelector('hero-p5-sketch')) return;
  host.appendChild(document.createElement('hero-p5-sketch'));
}

function isMounted() {
  const host = document.querySelector(HOST_SELECTOR);
  return !!(host && host.querySelector('hero-p5-sketch'));
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
