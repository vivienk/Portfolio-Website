// Kept outside the generated Framer bundle so the carousel is easy to maintain.
// Ports the ProgressiveSmearCarousel Framer code component (inward smear, edge
// blur, progressive size/rotate/depth falloff) to a plain custom element so it
// can stand in for the Projects section's carousel without a React runtime.
const projects = [
  { title: 'TomoIQ', href: '/tomoiq/', image: '/assets/fc5bc1691677744c-oBY2uvMTdiAh1mLCHD4AmM3v3qg.gif', poster: '/assets/project-posters/tomoai-frame-7.png' },
  { title: 'Tomo Onboarding Redesign', href: '/tomo_onboarding/', image: '/assets/beaee59ef2d978e4-IWeSp5oQI1hRwy2aYFWtN1CgY78.gif', poster: '/assets/project-posters/tomo-onboarding-frame-7.png' },
  { title: 'Footprints', href: '/footprints/', poster: '/assets/project-posters/footprints-frame-1.png', video: '/assets/project-videos/footprints-preview.mp4' },
  { title: 'Immersive Ink', href: '/immersive_ink/', image: '/assets/0a7891debdf32fca-HYq47f0BPDBkD9oFL7GGGrdhlGo.png' },
  { title: 'Journify', href: '/journify/', image: '/assets/56b714b7e821ad2f-2r8jCFonaEltbsX6zt5dFPMAg.png' },
  { title: 'Wokwalk', href: '/wokwalk/', image: '/assets/8c8fc1d9263905d6-bI8zzhgzSIYL2KqpDtwS3G5f7Zk.gif', poster: '/assets/project-posters/wokwalk-frame-7.png' },
  { title: 'Preci', href: '/preci/', image: '/assets/b06e0997595b48e4-dOFVnEJNjANJDUvjYIfGuWRgGw.png' },
];

// Layout ratio tuned on the carousel's own page: center 305x212, side 208x281,
// gap 64. The whole carousel is scaled 10% over that tuned baseline, then
// down 25% from there, and the selected card renders a further 20% larger
// than the (already-scaled) center size. Desktop only, cards are enlarged a
// further 25% on top of that, growing even more on bigger screens: flat past
// 810px up to a 1600px-wide "standard desktop" reference, then scaling up
// further for larger displays, capped so ultra-wide monitors don't blow up.
// Then the whole desktop carousel was enlarged another 25% on top of all of
// that, then another 25% again, then shrunk back down 15% (desktop only).
const BIG_SCREEN_EXTRA = Math.min(0.35, Math.max(0, (window.innerWidth - 1600) / 1600) * 0.5);
const DESKTOP_BOOST = window.innerWidth > 809 ? (1.25 + BIG_SCREEN_EXTRA) * 1.25 * 1.25 * 0.85 : 1;
const SCALE = 1.1 * 0.75 * DESKTOP_BOOST;
const ITEM_W = 305 * SCALE, ITEM_H = 212 * SCALE, SIDE_W = 208 * SCALE, SIDE_H = 281 * SCALE, GAP = 58 * SCALE;
const CENTER_W = ITEM_W * 1.2, CENTER_H = ITEM_H * 1.2;
const MAX_ROTATION = 90, PERSPECTIVE = 900, BORDER_RADIUS = 14 * SCALE;
const STIFFNESS = 180, DAMPING = 26, MASS = 1;

const styles = `
  :host { display:block; width:100%; min-width:0; color:#fff; font-family:"Open Sauce Sans",Inter,sans-serif; }
  * { box-sizing:border-box; }
  .carousel { width:100%; }
  .stage { width:100%; height:528px; display:flex; align-items:center; justify-content:center; perspective:${PERSPECTIVE}px; overflow:hidden; position:relative; }
  .catcher { position:absolute; inset:0; z-index:50; cursor:grab; touch-action:pan-y; }
  .catcher.dragging { cursor:grabbing; }
  .anchor { position:relative; width:0; height:0; transform-style:preserve-3d; }
  .card { position:absolute; left:0; top:0; display:block; overflow:hidden; text-decoration:none; background:#151515; transform-style:preserve-3d; border-radius:${BORDER_RADIUS}px; box-shadow:0 0 0 1px #ffffff14, 0 0 0 0 #ffffff00; will-change:transform; transition:box-shadow .35s ease; }
  .card::after { content:""; position:absolute; inset:0; border-radius:inherit; box-shadow:inset 0 0 0 1px #ffffff14; pointer-events:none; }
  .card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; filter:grayscale(1) saturate(.45); transition:filter .25s ease; }
  .card[data-lit] img { filter:grayscale(0) saturate(1); }
  .card video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity .35s ease; pointer-events:none; }
  .card[data-video-active] video { opacity:1; }
  .card[data-hovered] { box-shadow:0 0 0 1px #ffffff40, 0 0 28px 4px #ffffff59; }
  .edge { position:absolute; top:0; bottom:0; width:16%; pointer-events:none; z-index:60; }
  .edge.left { left:0; -webkit-mask-image:linear-gradient(to right,#000 0%,transparent 100%); mask-image:linear-gradient(to right,#000 0%,transparent 100%); }
  .edge.right { right:0; -webkit-mask-image:linear-gradient(to left,#000 0%,transparent 100%); mask-image:linear-gradient(to left,#000 0%,transparent 100%); }
  @supports (backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px)) {
    .edge { backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); }
  }
  .details { width:min(100% - 64px,1080px); margin:22px auto 0; display:flex; align-items:center; justify-content:space-between; gap:32px; }
  .project { display:flex; align-items:baseline; min-width:0; gap:22px; }
  .count { color:#777; font-size:13px; letter-spacing:.08em; white-space:nowrap; font-variant-numeric:tabular-nums; }
  .title { margin:0; font-size:clamp(22px,2.42vw,33px); line-height:1.25; font-weight:500; letter-spacing:-.045em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .case-link { flex:none; display:flex; align-items:center; gap:10px; color:#ccc; font-size:14px; text-decoration:none; padding:6px 0; }
  .case-link svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
  .case-link:hover { color:#fff; }
  .dots { display:none; }
  @media (min-width:810px) {
    .title { transform:translateY(-72px); }
    .count { display:none; }
    .case-link { transform:translateY(-72px); }
  }
  @media (max-width:809px) {
    .stage { height:396px; }
    /* No horizontal margin/inset here anymore — the left inset is set at
       render() time (JS) to match the selected card's actual left edge,
       via padding-left, so it tracks CENTER_W instead of a guessed value. */
    .details { width:100%; margin-top:14px; align-items:flex-start; gap:16px; padding-right:20px; }
    .project { display:block; }
    .count { display:none; }
    .title { font-size:22px; }
    /* Dots moved between the stage and the title/case-link (was after
       them) — sits right under the carousel with a small gap, no pull-up
       needed now that it isn't competing with .details for the same
       visual space. Dots and title (.details is positioned relative to
       dots via its own margin-top, so it rides along automatically)
       shifted up 36px, then another 32px (real margin, not transform, so
       the section's flow height keeps shrinking to match rather than
       leaving dead space) — 68px up from the original position total. */
    .dots { display:flex; justify-content:center; align-items:center; gap:7.2px; margin:-52px auto 0; padding:0; list-style:none; }
    .dots button { appearance:none; border:0; background:#4d4d4d; width:5.6px; height:5.6px; border-radius:50%; padding:0; cursor:pointer; transition:background-color .25s ease,transform .25s ease; }
    .dots button[aria-current="true"] { background:#fff; transform:scale(1.25); }
  }
  @media (prefers-reduced-motion:reduce) { .card { transition:none; } .card img { transition:none; } }
`;

const arrowRight = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;

const wrap = (value, length) => ((value % length) + length) % length;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const sign = value => (value > 0 ? 1 : value < 0 ? -1 : 0);
// Shortest signed distance from `position` to `index` around the loop.
const distance = (index, position, length) => wrap(index - position + length / 2, length) - length / 2;

class ProgressiveSmearCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.total = projects.length;
    this.rawTarget = 0; // where drag/wheel wants the scroll to be (any real number)
    this.position = 0;  // spring-smoothed scroll value actually rendered
    this.velocity = 0;
    this.inView = false;
    this.hoveredIndex = null;
    this.displayIndex = null;
  }

  connectedCallback() {
    if (this.abort) return;
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');

    this.shadowRoot.innerHTML = `<style>${styles}</style>
      <div class="carousel">
        <div class="stage">
          <div class="catcher" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Featured projects, drag or scroll to browse"></div>
          <div class="anchor">
            ${projects.map((project, i) => `<a class="card" href="${project.href}" data-index="${i}" aria-label="Open ${project.title} case study" tabindex="-1">
              <img src="${project.poster || project.image}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
              ${project.video ? `<video src="${project.video}" poster="${project.poster || ''}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>` : ''}
            </a>`).join('')}
          </div>
          <div class="edge left"></div>
          <div class="edge right"></div>
        </div>
        <div class="dots" role="tablist" aria-label="Choose a project">
          ${projects.map((project, i) => `<button type="button" role="tab" data-index="${i}" aria-label="Show ${project.title}" aria-current="${i === 0}"></button>`).join('')}
        </div>
        <div class="details">
          <div class="project"><span class="count" aria-hidden="true"></span><h2 class="title"></h2></div>
          <a class="case-link"><span>View case study</span>${arrowRight}</a>
        </div>
      </div>`;

    const find = selector => this.shadowRoot.querySelector(selector);
    const on = (element, event, callback, options = {}) => element.addEventListener(event, callback, { ...options, signal });

    this.catcher = find('.catcher');
    this.stage = find('.stage');
    this.details = find('.details');
    this.cards = [...this.shadowRoot.querySelectorAll('.card')];
    this.dots = [...this.shadowRoot.querySelectorAll('.dots button')];
    this.centerIndex = 0;

    this.cards.forEach((card, i) => {
      on(card, 'click', event => {
        if (this.dragMoved) { event.preventDefault(); return; }
        if (i !== this.centerIndex) {
          event.preventDefault();
          this.rawTarget = this.position + distance(i, this.position, this.total);
          this.wake();
        }
      });
    });

    this.dots.forEach((dot, i) => {
      on(dot, 'click', () => {
        this.rawTarget = this.position + distance(i, this.position, this.total);
        this.wake();
      });
    });

    // The drag/wheel catcher sits above the cards (it needs the whole stage
    // to be draggable, not just the cards themselves), which means real
    // pointer events never reach an individual .card — pointerenter/leave
    // on the cards never fired. Hit-testing through the catcher via
    // elementFromPoint (briefly making it non-interactive so it doesn't just
    // return itself) is what actually finds which card is under the cursor.
    on(this.catcher, 'pointermove', event => {
      if (event.pointerType !== 'mouse' || this.dragMoved) return;
      this.catcher.style.pointerEvents = 'none';
      const el = this.shadowRoot.elementFromPoint(event.clientX, event.clientY);
      this.catcher.style.pointerEvents = '';
      const card = el ? el.closest('.card') : null;
      const idx = card ? this.cards.indexOf(card) : null;
      if (idx !== this.hoveredIndex) {
        this.hoveredIndex = idx;
        this.render();
      }
    });
    on(this.catcher, 'pointerleave', () => {
      if (this.hoveredIndex !== null) {
        this.hoveredIndex = null;
        this.render();
      }
    });

    // Same overlay problem as hover: real clicks land on .catcher, not on
    // the individual .card elements underneath it, so their own 'click'
    // listeners (below, in the cards.forEach loop) never fire for a real
    // mouse/touch click — only for a keyboard Enter/Space on a focused
    // card, which targets the element directly and bypasses the overlay.
    // Hit-test the same way hover does, then replay the click on the
    // actual card so its existing navigate-or-center logic runs unchanged.
    on(this.catcher, 'click', event => {
      if (this.dragMoved) return;
      this.catcher.style.pointerEvents = 'none';
      const el = this.shadowRoot.elementFromPoint(event.clientX, event.clientY);
      this.catcher.style.pointerEvents = '';
      const card = el ? el.closest('.card') : null;
      if (card) card.click();
    });

    on(this.catcher, 'wheel', event => {
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY * 0.8;
      this.rawTarget += delta * 0.004;
      this.wake();
      clearTimeout(this.snapTimer);
      this.snapTimer = setTimeout(() => { this.rawTarget = Math.round(this.rawTarget); this.wake(); }, 150);
    }, { passive: false });

    on(this.catcher, 'pointerdown', event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      clearTimeout(this.snapTimer);
      this.drag = { id: event.pointerId, x: event.clientX, lastX: event.clientX, time: event.timeStamp, moved: false };
      this.dragMoved = false;
    });
    on(this.catcher, 'pointermove', event => {
      const drag = this.drag;
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        this.dragMoved = true;
        this.catcher.setPointerCapture(event.pointerId);
        this.catcher.classList.add('dragging');
      }
      const stepDx = event.clientX - drag.lastX;
      this.rawTarget += -stepDx * 0.005;
      drag.lastX = event.clientX;
      drag.time = event.timeStamp;
      this.wake();
    });
    const endDrag = event => {
      const drag = this.drag;
      if (!drag || (event && event.pointerId !== drag.id)) return;
      this.drag = null;
      this.catcher.classList.remove('dragging');
      if (drag.moved) {
        const dt = Math.max(8, (event?.timeStamp ?? drag.time) - drag.time) / 1000;
        const velocity = event ? -(event.clientX - drag.lastX) / dt / 200 : 0;
        this.rawTarget += velocity * 0.0015 * 200;
        this.rawTarget = Math.round(this.rawTarget);
        this.wake();
      }
      setTimeout(() => { this.dragMoved = false; }, 0);
    };
    on(this.catcher, 'pointerup', endDrag);
    on(this.catcher, 'pointercancel', endDrag);
    on(this.catcher, 'lostpointercapture', endDrag);

    on(this.catcher, 'keydown', event => {
      const step = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity }[event.key];
      if (step === undefined) return;
      event.preventDefault();
      this.rawTarget = event.key === 'Home' ? 0 : event.key === 'End' ? this.total - 1
        : Math.round(this.position) + step;
      this.wake();
    });

    on(this.motion, 'change', () => this.wake());
    this.observer = new IntersectionObserver(entries => {
      this.inView = entries[0].isIntersecting;
      if (this.inView) this.wake();
    }, { threshold: 0.05 });
    this.observer.observe(this);

    this.render();
    this.wake();
  }

  wake() {
    if (this.frame || !this.isConnected) return;
    if (!this.inView && Math.abs(this.rawTarget - this.position) < 0.001) return;
    let last;
    const tick = time => {
      const dt = last === undefined ? 1 / 60 : Math.min((time - last) / 1000, 1 / 30);
      last = time;
      if (this.motion.matches) {
        this.position = this.rawTarget;
        this.velocity = 0;
      } else {
        const acceleration = (STIFFNESS * (this.rawTarget - this.position) - DAMPING * this.velocity) / MASS;
        this.velocity += acceleration * dt;
        this.position += this.velocity * dt;
      }
      this.render();
      const settled = Math.abs(this.rawTarget - this.position) < 0.001 && Math.abs(this.velocity) < 0.001;
      if (settled) {
        this.position = this.rawTarget;
        this.velocity = 0;
        this.render();
        this.frame = null;
      } else {
        this.frame = requestAnimationFrame(tick);
      }
    };
    this.frame = requestAnimationFrame(tick);
  }

  render() {
    const v = this.position;
    this.centerIndex = wrap(Math.round(v), this.total);
    if (this.dotIndex !== this.centerIndex) {
      this.dotIndex = this.centerIndex;
      this.dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === this.centerIndex)));
    }
    this.cards.forEach((card, i) => {
      const offset = distance(i, v, this.total);
      const a = Math.abs(offset);
      const s = sign(offset);
      const t = clamp(a, 0, 1);
      // Center card renders CENTER_W/H (20% over the old base ITEM_W/H);
      // side cards keep their original SIDE_W/H, unaffected.
      const width = CENTER_W + (SIDE_W - CENTER_W) * t;
      const height = CENTER_H + (SIDE_H - CENTER_H) * t;

      const centerToNext = CENTER_W / 2 + GAP + SIDE_W / 2;
      const sideToSide = SIDE_W + GAP;
      const x = a === 0 ? 0 : a <= 1 ? s * centerToNext * a : s * (centerToNext + (a - 1) * sideToSide * 0.85);
      const z = -a * 200;
      const rotateY = s * Math.min(a * 35, MAX_ROTATION);
      const zIndex = 1000 - Math.round(a * 10);
      const opacity = a <= 5 ? 1 : a <= 7 ? 1 - (a - 5) / 2 : 0;
      const isCenter = i === this.centerIndex && a < 0.06;
      const isHovered = i === this.hoveredIndex;
      const isLit = isCenter || isHovered;

      card.style.marginLeft = `${-width / 2}px`;
      card.style.marginTop = `${-height / 2}px`;
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      card.style.zIndex = String(zIndex);
      card.style.opacity = String(opacity);
      card.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${rotateY}deg)`;
      card.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
      card.toggleAttribute('data-lit', isLit);
      // Glow is specifically for hovering a project that isn't already the
      // selected one — the selected card's prominence comes from its size.
      card.toggleAttribute('data-hovered', isHovered && !isCenter);
      card.tabIndex = isCenter ? 0 : -1;

      const image = card.firstElementChild;
      const project = projects[i];
      // Video-driven cards keep the static poster in the <img> underneath and
      // let the <video> layered on top carry the "live" preview instead.
      const wantLive = isCenter && project.poster && !this.motion.matches && !project.video;
      const source = wantLive ? project.image : (project.poster || project.image);
      if (image.getAttribute('src') !== source) image.setAttribute('src', source);
      if (image.style.opacity !== '1') image.style.opacity = '1';

      // Only the selected (centered) card's video plays; every other card's
      // video stays paused and hidden so nothing plays off-screen or unseen.
      const video = card.querySelector('video');
      if (video) {
        const shouldPlay = isCenter && !this.motion.matches;
        card.toggleAttribute('data-video-active', shouldPlay);
        if (shouldPlay) {
          if (video.paused) { video.currentTime = 0; video.play().catch(() => {}); }
        } else if (!video.paused) {
          video.pause();
        }
      }
    });

    // Mobile only: line up the title/details row's left edge with the
    // selected (center) card's own left edge, instead of a fixed inset —
    // the center card's width (and so its left edge) depends on the tuned
    // CENTER_W constant, so this is computed rather than hardcoded. Nudged
    // 18px further left than exact card alignment, per request.
    if (window.innerWidth <= 809) {
      const centerLeft = this.stage.clientWidth / 2 - CENTER_W / 2 - 18;
      this.details.style.paddingLeft = `${Math.max(0, centerLeft)}px`;
    } else if (this.details.style.paddingLeft) {
      this.details.style.paddingLeft = '';
    }

    // Caption follows whichever card is currently "lit" (centered, or
    // hovered off-center) — same pattern as project-carousel.mjs's .details.
    const displayIndex = this.hoveredIndex !== null && Math.abs(distance(this.hoveredIndex, v, this.total)) < 1.5
      ? this.hoveredIndex
      : this.centerIndex;
    if (this.displayIndex !== displayIndex) {
      this.displayIndex = displayIndex;
      const project = projects[displayIndex];
      this.shadowRoot.querySelector('.count').textContent = `${String(displayIndex + 1).padStart(2, '0')} / ${String(this.total).padStart(2, '0')}`;
      this.shadowRoot.querySelector('.title').textContent = project.title;
      const link = this.shadowRoot.querySelector('.case-link');
      link.href = project.href;
      link.setAttribute('aria-label', `View ${project.title} case study`);
    }
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.abort = null;
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.frame = null;
    clearTimeout(this.snapTimer);
    this.drag = null;
  }
}

if (!customElements.get('progressive-smear-carousel')) customElements.define('progressive-smear-carousel', ProgressiveSmearCarousel);
