// Replaces the site's original Framer nav (a plain top-right text nav —
// see index.html's ".framer-11n6lfm-container", now hidden via CSS) with
// a floating "liquid glass" pill nav, matching the design at
// liquid-glass-navbar.framer.website: a centered, frosted/translucent
// pill holding the logo, name, links, and (new) a light/dark theme
// toggle, collapsing to a hamburger that expands the pill downward on
// mobile. Plain custom element, no shadow-DOM framework dependency,
// following the same pattern as hero-p5-sketch.mjs / progressive-smear-
// carousel.mjs elsewhere in this project.
import { getTheme, setTheme, onThemeChange } from './theme.mjs';

const PROJECTS_SECTION_SELECTOR = '.framer-1mm21uq';
const CONTACT_HREF = 'https://cal.com/vivien-kong-n6hk7z/30min';

const sunIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>`;
const hamburgerIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

const styles = `
  :host {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: block;
    font-family: "Open Sauce Sans", Inter, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  * { box-sizing: border-box; }
  .pill {
    display: flex;
    flex-direction: column;
    width: min(92vw, 640px);
    border-radius: 28px;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    box-shadow: 0 8px 32px var(--glass-shadow), inset 0 1px 0 var(--glass-shine);
    transition: background .3s ease, border-color .3s ease, box-shadow .3s ease;
    overflow: hidden;
  }
  :host([data-theme="dark"]) .pill {
    --glass-bg: rgba(22,22,22,.55);
    --glass-border: rgba(255,255,255,.14);
    --glass-shadow: rgba(0,0,0,.35);
    --glass-shine: rgba(255,255,255,.08);
    --ink: rgba(255,255,255,.92);
    --ink-dim: rgba(255,255,255,.6);
    --chip-bg: #fff;
    --chip-ink: #111;
  }
  :host([data-theme="light"]) .pill {
    --glass-bg: rgba(255,255,255,.55);
    --glass-border: rgba(255,255,255,.5);
    --glass-shadow: rgba(0,0,0,.12);
    --glass-shine: rgba(255,255,255,.7);
    --ink: rgba(20,20,20,.92);
    --ink-dim: rgba(20,20,20,.55);
    --chip-bg: #111;
    --chip-ink: #fff;
  }
  .top-row { display: flex; align-items: center; align-content: center; justify-content: space-between; column-gap: 12px; row-gap: 0; padding: 8px 10px 8px 14px; }
  .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
  .brand img { width: 26px; height: 26px; object-fit: contain; flex: none; }
  /* Same serif used by the hero heading ("Welcome to VIVIEN's DESIGN
     LAB") and by the case-study pages' own nav logo — @font-face rules
     aren't shadow-scoped, so referencing the same family name here picks
     up the font already loaded at the document level, no separate
     import needed. */
  .brand span { font-family: "Sigurd Light", Garamond, "EB Garamond", serif; color: var(--ink); font-weight: 600; font-size: 17px; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .links { display: flex; align-items: center; gap: 4px; }
  .link {
    color: var(--ink-dim);
    text-decoration: none;
    font-size: 14px;
    padding: 9px 14px;
    border-radius: 18px;
    transition: color .2s ease, background .2s ease;
    white-space: nowrap;
  }
  .link:hover { color: var(--ink); background: var(--glass-shine); }
  button.icon-btn {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--ink);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex: none;
    transition: background .2s ease;
  }
  button.icon-btn:hover { background: var(--glass-shine); }
  button.icon-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  /* button.icon-btn (above) sets display:grid at (element+class)
     specificity; the hamburger button carries both .icon-btn and
     .hamburger, so hiding it needs the same specificity to actually win —
     a bare .hamburger{display:none} loses that tie. */
  button.hamburger { display: none; }
  .panel {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 4px;
    /* Desktop: .panel (Projects/Contact) and .theme-toggle are separate
       top-row flex children, so top-row's justify-content:space-between
       spreads all three (brand, panel, toggle) evenly — same issue the
       mobile row had with the toggle stranded before the hamburger fix
       below. margin-left:auto here eats the leftover space in front of
       the panel instead, keeping brand pinned left and pulling
       panel+toggle flush together at the right. Harmless on mobile: the
       media query below gives .panel flex-basis:100% on its own wrapped
       line, where there's no leftover inline space for auto to consume.
    */
    margin-left: auto;
  }
  /* Mobile: collapse links into an expandable panel under the top row.
     .panel sits between .brand and button.hamburger in the top-row flex
     row, so without flex-wrap it's squeezed into a narrow column between
     them instead of dropping full-width below — wrap the row, reorder the
     hamburger ahead of it, and give the panel a 100% flex-basis so it's
     forced onto its own line. */
  @media (max-width: 809px) {
    :host { top: 12px; width: min(92vw, 420px); left: 50%; }
    /* Collapsed: a full stadium/pill (radius = half the ~66px bar height,
       so corners are true semicircles, not just "rounded"). Open: a
       smaller fixed radius reads better on the taller expanded panel than
       a stadium shape would. */
    .pill { width: 100%; border-radius: 999px; transition: border-radius .3s ease; }
    :host([data-open]) .pill { border-radius: 26px; }
    .top-row { flex-wrap: wrap; }
    /* Theme toggle sits in the always-visible row itself, left of the
       hamburger, rather than inside the panel it collapses — switching
       theme shouldn't require opening the menu first. order alone isn't
       enough: with three separate flex children on this line (brand,
       toggle, hamburger) top-row's justify-content:space-between spreads
       all three evenly, leaving the toggle stranded mid-row instead of
       snug against the hamburger. margin-left:auto eats that leftover
       space in front of the toggle instead, so brand stays pinned left
       and the toggle+hamburger pair sits flush together at the right,
       12px apart via the row's own column-gap. */
    .theme-toggle { order: 1; margin-left: auto; }
    /* Same filled-circle look at rest as the other icon buttons get only
       on hover/press — a plain line-icon with no chip read as unfinished
       next to the pill's other rounded surfaces. */
    button.hamburger { display: grid; order: 2; background: var(--glass-shine); }
    .panel {
      order: 3;
      flex: 1 1 100%;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      padding: 0 12px;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height .35s ease, opacity .25s ease, padding .35s ease;
    }
    :host([data-open]) .panel {
      max-height: 320px;
      opacity: 1;
      padding: 4px 12px 14px;
    }
    .links { flex-direction: column; align-items: stretch; gap: 2px; width: 100%; }
    .link { padding: 12px 14px; border-radius: 14px; text-align: center; }
  }
`;

class GlassNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.open = false;
  }

  connectedCallback() {
    if (this._wired) return;
    this._wired = true;

    this.shadowRoot.innerHTML = `<style>${styles}</style>
      <div class="pill">
        <div class="top-row">
          <a class="brand" href="/" aria-label="Vivien Kong, home">
            <img src="/brand-icon.svg" alt="">
            <span>Vivien Kong</span>
          </a>
          <div class="panel desktop-panel">
            <nav class="links">
              <a class="link" data-nav="projects" href="./#projects">Projects</a>
              <a class="link" href="${CONTACT_HREF}" target="_blank" rel="noopener">Contact</a>
            </nav>
          </div>
          <button type="button" class="icon-btn theme-toggle" aria-label="Toggle light/dark theme"></button>
          <button type="button" class="icon-btn hamburger" aria-label="Open menu" aria-expanded="false"></button>
        </div>
      </div>`;

    this.themeToggle = this.shadowRoot.querySelector('.theme-toggle');
    this.hamburger = this.shadowRoot.querySelector('.hamburger');
    this.projectsLink = this.shadowRoot.querySelector('[data-nav="projects"]');
    this.pill = this.shadowRoot.querySelector('.pill');

    this.applyTheme(getTheme());
    this.setOpen(false);
    this._unsubscribeTheme = onThemeChange(theme => this.applyTheme(theme));

    this.themeToggle.addEventListener('click', () => setTheme(getTheme() === 'light' ? 'dark' : 'light'));
    this.hamburger.addEventListener('click', () => this.setOpen(!this.open));
    this.projectsLink.addEventListener('click', event => this.scrollToProjects(event));
    this.shadowRoot.querySelectorAll('.link').forEach(link => {
      link.addEventListener('click', () => this.setOpen(false));
    });

    // Close the mobile panel if the layout crosses back to desktop width
    // while it's open, so it doesn't get stuck expanded.
    this._mobileQuery = window.matchMedia('(max-width: 809px)');
    const handleBreakpoint = () => { if (!this._mobileQuery.matches) this.setOpen(false); };
    this._mobileQuery.addEventListener('change', handleBreakpoint);
    this._handleBreakpoint = handleBreakpoint;
  }

  applyTheme(theme) {
    this.setAttribute('data-theme', theme);
    if (this.themeToggle) {
      const isLight = theme === 'light';
      this.themeToggle.innerHTML = isLight ? moonIcon : sunIcon;
      this.themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  setOpen(open) {
    this.open = open;
    this.toggleAttribute('data-open', open);
    this.hamburger.innerHTML = open ? closeIcon : hamburgerIcon;
    this.hamburger.setAttribute('aria-expanded', String(open));
    this.hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  scrollToProjects(event) {
    const section = document.querySelector(PROJECTS_SECTION_SELECTOR);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  disconnectedCallback() {
    this._unsubscribeTheme?.();
    this._mobileQuery?.removeEventListener('change', this._handleBreakpoint);
  }
}

if (!customElements.get('glass-navbar')) customElements.define('glass-navbar', GlassNavbar);
