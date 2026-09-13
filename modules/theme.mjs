// Single source of truth for the site's light/dark theme. The actual
// switch is document.documentElement.dataset.theme ('dark' | 'light'),
// already set synchronously by an inline <script> at the top of <head>
// (before any CSS) so there's no flash of the wrong theme on load — this
// module just needs to agree with that inline script's logic and be the
// one place anything that changes the theme goes through, so every
// listener (navbar swatch, hero sketch, carousel) stays in sync.
const STORAGE_KEY = 'theme';

export function getTheme() {
  const current = document.documentElement.dataset.theme;
  return current === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
  return getTheme();
}

export function onThemeChange(callback) {
  const handler = event => callback(event.detail.theme);
  window.addEventListener('themechange', handler);
  return () => window.removeEventListener('themechange', handler);
}
