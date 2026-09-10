// TomoIQ uses the current published Framer runtime; cross its boundary with a full navigation.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.composedPath().find((node) => node instanceof HTMLAnchorElement);
  if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
  const destination = new URL(anchor.href, location.href);
  const isTomoIQ = (path) => /^\/tomoiq\/?$/.test(path);
  if (destination.origin !== location.origin || isTomoIQ(destination.pathname) === isTomoIQ(location.pathname)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.assign(destination.href);
}, true);
