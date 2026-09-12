// Mounts <progressive-smear-carousel> into the "Projects" section at
// runtime, instead of putting it directly in index.html.
//
// That section is inside React's hydrated #main tree, and the compiled
// bundle expects <project-carousel> there specifically. Any different node
// placed there by hand in the static HTML gets silently discarded and
// replaced with whatever the bundle actually renders — sometimes more than
// once, whenever that subtree re-reconciles. So rather than caching a
// reference and mounting once, the host is re-queried fresh on every DOM
// mutation anywhere on the page and the carousel is (re)appended whenever
// missing. Cheap and self-healing regardless of how many times React
// reconciles that area.
const HOST_SELECTOR = '.framer-1mm21uq';

let pending = false;

function ensureMounted() {
  pending = false;
  const host = document.querySelector(HOST_SELECTOR);
  if (!host || host.querySelector('progressive-smear-carousel')) return;
  host.appendChild(document.createElement('progressive-smear-carousel'));
}

function isMounted() {
  const host = document.querySelector(HOST_SELECTOR);
  return !!(host && host.querySelector('progressive-smear-carousel'));
}

function schedule() {
  if (pending) return;
  pending = true;
  // Not requestAnimationFrame: rAF callbacks can be paused indefinitely by
  // the browser while the tab/pane is backgrounded, which would leave
  // `pending` stuck true forever and silently stop every future mutation
  // from triggering a mount attempt. setTimeout still runs (at worst
  // throttled) even when hidden.
  setTimeout(ensureMounted, 0);
}

new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
schedule();
// Mutations near load can be sparse enough that the observer never fires
// again once the Projects subtree's reconciliation settles; a slow poll for
// the first several seconds is a cheap backstop against ever getting stuck.
let attempts = 0;
const poll = setInterval(() => {
  ensureMounted();
  if (isMounted() || ++attempts > 20) clearInterval(poll);
}, 500);
