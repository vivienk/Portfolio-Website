// The nav's "Projects" link (href="./#projects") doesn't do anything: no
// element in this export has id="projects" for native anchor scrolling to
// find, and Framer's own SPA click-interception — which would normally
// scroll a matching section into view — doesn't resolve it either in this
// hand-edited export. This wires up working click handling, and scrolls
// the actual Projects section (.framer-1mm21uq) to the CENTER of the
// viewport rather than its top (Framer's usual default for a working
// link), since the section is often taller than the viewport and
// top-alignment would leave the carousel mostly below the fold.
const LINK_SELECTOR = 'a[href="./#projects"]';
const SECTION_SELECTOR = '.framer-1mm21uq';

function scrollToProjects(event) {
  const section = document.querySelector(SECTION_SELECTOR);
  if (!section) return;
  event.preventDefault();
  event.stopPropagation();
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function wireLinks() {
  document.querySelectorAll(LINK_SELECTOR).forEach(link => {
    if (link.dataset.projectsScrollWired) return;
    link.dataset.projectsScrollWired = 'true';
    link.addEventListener('click', scrollToProjects, true);
  });
}

new MutationObserver(wireLinks).observe(document.documentElement, { childList: true, subtree: true });
wireLinks();
