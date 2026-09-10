// Kept outside the generated Framer bundle so the carousel is easy to maintain.
const projects = [
  { title: 'TomoIQ', href: '/tomoiq/', image: '/assets/fc5bc1691677744c-oBY2uvMTdiAh1mLCHD4AmM3v3qg.gif', poster: '/assets/project-posters/tomoai-frame-7.png' },
  { title: 'Tomo Onboarding Redesign', href: '/tomo_onboarding/', image: '/assets/beaee59ef2d978e4-IWeSp5oQI1hRwy2aYFWtN1CgY78.gif', poster: '/assets/project-posters/tomo-onboarding-frame-7.png' },
  { title: 'Footprints', href: '/footprints/', image: '/assets/0cc23a86a5f271b5-HNh67cA53PnIqydrjfXtdh60w.gif', poster: '/assets/project-posters/footprints-frame-7.png' },
  { title: 'Immersive Ink', href: '/immersive_ink/', image: '/assets/0a7891debdf32fca-HYq47f0BPDBkD9oFL7GGGrdhlGo.png' },
  { title: 'Journify', href: '/journify/', image: '/assets/56b714b7e821ad2f-2r8jCFonaEltbsX6zt5dFPMAg.png' },
  { title: 'Wokwalk', href: '/wokwalk/', image: '/assets/8c8fc1d9263905d6-bI8zzhgzSIYL2KqpDtwS3G5f7Zk.gif', poster: '/assets/project-posters/wokwalk-frame-7.png' },
  { title: 'Preci', href: '/preci/', image: '/assets/b06e0997595b48e4-dOFVnEJNjANJDUvjYIfGuWRgGw.png' },
];

// An inward-facing gallery inspired by Tom Miller's Parallax Photo Carousel:
// https://codepen.io/creativeocean/pen/mdROBXx
// Every project remains a single link; invisible panels wrap behind the gallery.
const styles = `
  :host { display:block; width:100%; min-width:0; color:#fff; font-family:"Open Sauce Sans",Inter,sans-serif; }
  * { box-sizing:border-box; }
  .carousel { width:100%; }
  .viewport { overflow:hidden; padding:12px 0; }
  .track { position:relative; width:100%; height:calc(clamp(440px,46vw,600px) * 2 / 3); perspective:1800px; transform-style:preserve-3d; touch-action:pan-y; cursor:grab; user-select:none; -webkit-user-select:none; }
  .track.dragging,.track.dragging a { cursor:grabbing; }
  .slide { position:absolute; left:50%; top:50%; width:calc(clamp(240px,29vw,360px) * 2 / 3); height:auto; aspect-ratio:10 / 8.5; opacity:.45; backface-visibility:hidden; -webkit-backface-visibility:hidden; }
  .slide[data-active] { aspect-ratio:12 / 10; }
  .slide[data-hovered] { aspect-ratio:16 / 12; }
  .card { position:relative; display:block; width:100%; height:100%; overflow:hidden; border-radius:12pt; background:#151515; color:#fff; text-decoration:none; box-shadow:0 0 0 1px #ffffff14; }
  .card img { display:block; width:124%; max-width:none; height:100%; margin-left:-12%; object-fit:cover; pointer-events:none; filter:grayscale(1); }
  .slide[data-active] .card img, .slide[data-hovered] .card img { filter:none; }
  .card::after { content:""; position:absolute; inset:0; border-radius:inherit; box-shadow:inset 0 0 0 1px #ffffff14; pointer-events:none; }
  .details { width:min(100% - 64px,1080px); margin:20px auto 0; display:flex; align-items:center; justify-content:space-between; gap:32px; }
  .project { display:flex; align-items:baseline; min-width:0; gap:22px; }
  .count { color:#777; font-size:12px; letter-spacing:.08em; white-space:nowrap; font-variant-numeric:tabular-nums; }
  .title { margin:0; font-size:clamp(20px,2.2vw,30px); line-height:1.25; font-weight:500; letter-spacing:-.045em; }
  .case-link { flex:none; display:flex; align-items:center; gap:16px; color:#ccc; font-size:13px; text-decoration:none; padding:12px 0; }
  svg { width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
  .controls { width:min(100% - 64px,1080px); margin:22px auto 0; padding-top:14px; border-top:1px solid #ffffff26; display:flex; align-items:center; justify-content:space-between; gap:20px; }
  .hint { margin:0; color:#707070; font-size:11px; letter-spacing:.12em; text-transform:uppercase; }
  .actions,.dots { display:flex; align-items:center; }
  .actions { gap:8px; }
  button { appearance:none; cursor:pointer; display:grid; place-items:center; color:#aaa; border:1px solid transparent; border-radius:50%; background:transparent; width:44px; height:44px; padding:0; }
  .previous,.next { border-color:#ffffff30; color:#eee; }
  .pause { margin-right:12px; }
  .dot { width:24px; border:0; }
  .dot::before { content:""; width:4px; height:4px; border-radius:50%; background:#666; }
  .dot[aria-current="true"]::before { width:6px; height:6px; background:#fff; }
  button:disabled { opacity:.45; cursor:default; }
  :is(button,a,.track):focus-visible { outline:2px solid #fff; outline-offset:4px; }
  .card:focus-visible { outline-offset:-5px; }
  .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
  @media (hover:hover) and (pointer:fine) { button:not(:disabled):hover { background:#ffffff14; color:#fff; } .case-link:hover { color:#fff; } }
  @media (max-width:809px) {
    .track { height:calc(clamp(360px,100vw,510px) * 2 / 3); }
    .slide { width:calc(clamp(210px,61vw,310px) * 2 / 3); }
    .details { width:calc(100% - 40px); margin-top:12px; align-items:flex-start; gap:16px; }
    .project { display:block; }
    .count { display:block; margin-bottom:8px; font-size:10px; }
    .title { font-size:21px; }
    .case-link { padding-top:23px; gap:8px; font-size:11px; }
    .case-link span { max-width:54px; }
    .controls { width:calc(100% - 40px); margin-top:18px; gap:12px; }
    .hint { display:none; }
    .dot { width:20px; }
    .pause { margin-right:0; }
    .actions { gap:4px; }
  }
  @media (max-width:360px) { .dot { width:16px; } }
  @media (prefers-reduced-motion:reduce) { .track { scroll-behavior:auto; } }
`;
const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;
const PREVIEW_GAP = 31; // Previous 38px gap minus 7px.
const wrap = (value, length = projects.length) => ((value % length) + length) % length;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (index, position) => wrap(index - position + projects.length / 2) - projects.length / 2;

class ProjectCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' });
    this.position = 0;
    this.index = 0;
    this.velocity = 0;
    this.paused = false;
    this.hovered = false;
    this.focused = false;
    this.inView = false;
    this.dragging = false;
    this.rotating = false;
  }

  connectedCallback() {
    if (this.abort) return;
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.mobilePreview = matchMedia('(max-width:809px), (hover:none), (pointer:coarse)');
    this.hoveredPreviews = new Set();
    this.displayIndex = null;
    this.shadowRoot.innerHTML = `<style>${styles}</style>
      <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Selected projects">
        <div class="viewport"><div class="track" tabindex="0" aria-label="Drag or use left and right arrow keys to browse projects.">
          ${projects.map((project, i) => `<div class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${projects.length}: ${project.title}">
            <a class="card" href="${project.href}" aria-label="View ${project.title} case study" tabindex="${i === 0 ? '0' : '-1'}">
              <img src="${project.poster || project.image}" alt="${project.title} project preview" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
            </a></div>`).join('')}
        </div></div>
        <div class="details">
          <div class="project"><span class="count" aria-hidden="true"></span><h2 class="title"></h2></div>
          <a class="case-link"><span>View case study</span>${arrow('right')}</a>
        </div>
        <div class="controls">
          <p class="hint">Drag to explore</p>
          <div class="dots" role="group" aria-label="Choose a project">${projects.map((project, i) => `<button class="dot" type="button" aria-label="Show ${project.title}" aria-current="${i === 0}"></button>`).join('')}</div>
          <div class="actions">
            <button class="pause" type="button" aria-label="Pause autoplay"></button>
            <button class="previous" type="button" aria-label="Previous project">${arrow('left')}</button>
            <button class="next" type="button" aria-label="Next project">${arrow('right')}</button>
          </div>
        </div>
        <p class="sr-only status" aria-live="polite" aria-atomic="true"></p>
      </div>`;
    const find = selector => this.shadowRoot.querySelector(selector);
    this.track = find('.track');
    this.slides = [...this.shadowRoot.querySelectorAll('.slide')];
    this.dots = [...this.shadowRoot.querySelectorAll('.dot')];
    this.pauseButton = find('.pause');
    const on = (element, event, callback, options = {}) => element.addEventListener(event, callback, { ...options, signal });
    const updatePreviews = () => this.requestPreviewUpdate();
    this.previews = this.slides.map((slide, i) => {
      const card = slide.querySelector('.card');
      on(card, 'pointerenter', event => {
        if (event.pointerType !== 'mouse') return;
        this.hoveredPreviews.add(i);
        this.render();
      });
      on(card, 'pointerleave', () => { this.hoveredPreviews.delete(i); this.render(); });
      on(card, 'click', event => {
        if (Date.now() < (this.ignoreClickUntil || 0)) { event.preventDefault(); return; }
        if (i !== this.index || Math.abs(distance(i, this.position)) > .05) {
          event.preventDefault();
          this.goTo(i, { instant:event.detail === 0, announce:true });
        }
      });
      return { card, image:slide.querySelector('img') };
    });
    on(find('.previous'), 'click', event => this.goTo(this.index - 1, { instant:event.detail === 0, announce:true }));
    on(find('.next'), 'click', event => this.goTo(this.index + 1, { instant:event.detail === 0, announce:true }));
    this.dots.forEach((dot, i) => on(dot, 'click', event => this.goTo(i, { instant:event.detail === 0, announce:true })));
    on(this.pauseButton, 'click', () => { this.paused = !this.paused; this.updatePause(); this.schedule(); });
    on(this.track, 'keydown', event => {
      const index = { ArrowLeft:this.index - 1, ArrowRight:this.index + 1, Home:0, End:projects.length - 1 }[event.key];
      if (index === undefined) return;
      event.preventDefault();
      this.track.focus({ preventScroll:true });
      this.goTo(index, { instant:true, announce:true });
    });
    on(this.track, 'dragstart', event => event.preventDefault());
    on(this.track, 'pointerdown', event => this.startDrag(event));
    on(this.track, 'pointermove', event => this.moveDrag(event));
    on(window, 'pointerup', event => this.endDrag(event));
    on(window, 'pointercancel', event => this.endDrag(event));
    on(this.track, 'lostpointercapture', event => this.endDrag(event));
    on(this, 'pointerenter', event => { if (event.pointerType === 'mouse') { this.hovered = true; this.schedule(); } });
    on(this, 'pointerleave', () => { this.hovered = false; this.schedule(); });
    on(this.shadowRoot, 'focusin', () => { this.focused = true; this.schedule(); });
    on(this.shadowRoot, 'focusout', () => queueMicrotask(() => { this.focused = Boolean(this.shadowRoot.activeElement); this.schedule(); }));
    on(window, 'scroll', updatePreviews, { passive:true });
    if (window.visualViewport) {
      on(window.visualViewport, 'scroll', updatePreviews, { passive:true });
      on(window.visualViewport, 'resize', updatePreviews, { passive:true });
    }
    on(this.mobilePreview, 'change', updatePreviews);
    on(document, 'visibilitychange', () => {
      if (document.hidden && this.rotating) this.goTo(this.target, { instant:true });
      this.schedule(); updatePreviews();
    });
    on(this.motion, 'change', () => {
      if (this.motion.matches) this.goTo(this.target ?? this.index, { instant:true });
      this.render(); this.updatePause(); this.schedule();
    });
    this.observer = new IntersectionObserver(entries => {
      this.inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .35;
      this.schedule(); updatePreviews();
    }, { threshold:.35 });
    this.observer.observe(this);
    this.resize = new ResizeObserver(() => this.measure());
    this.resize.observe(this.track);
    this.measure();
    this.updatePause();
  }

  measure() {
    this.cardWidth = this.slides[0].offsetWidth;
    this.radius = (this.cardWidth + PREVIEW_GAP) / (2 * Math.tan(Math.PI / 10));
    this.track.style.perspective = `${Math.max(1400, this.radius * 3.5)}px`;
    this.render();
  }

  render() {
    // The center panel is furthest away; neighbors curve toward the viewer.
    // Wrapping occurs at +/-126 degrees, safely behind the visible arc.
    this.index = wrap(Math.round(this.position));
    this.slides.forEach((slide, i) => {
      const delta = distance(i, this.position);
      const angle = delta * 36;
      const radians = angle * Math.PI / 180;
      const x = this.radius * Math.sin(radians);
      const z = this.radius * (1 - Math.cos(radians));
      const visible = Math.abs(angle) < 88;
      const scale = this.hoveredPreviews.has(i) ? 1.15 : 1;
      slide.style.transform = `translate(-50%,-50%) translate3d(${x}px,0,${z}px) rotateY(${-angle}deg) scale(${scale})`;
      slide.style.visibility = visible ? 'visible' : 'hidden';
      slide.style.pointerEvents = visible ? 'auto' : 'none';
      slide.style.opacity = this.hoveredPreviews.has(i) ? '1' : '.45';
      slide.setAttribute('aria-hidden', String(!visible));
      slide.toggleAttribute('data-active', i === this.index);
      slide.toggleAttribute('data-hovered', this.hoveredPreviews.has(i));
      this.previews[i].card.tabIndex = i === this.index ? 0 : -1;
      // Move the image in the opposite direction within its clipped frame.
      const parallax = this.motion.matches ? 0 : clamp(delta, -2, 2) * -4;
      this.previews[i].image.style.transform = `translate3d(${parallax}%,0,0)`;
      this.dots[i].setAttribute('aria-current', String(i === this.index));
    });
    const displayIndex = [...this.hoveredPreviews].reverse().find(i => Math.abs(distance(i, this.position)) * 36 < 88) ?? this.index;
    if (this.displayIndex !== displayIndex) {
      this.displayIndex = displayIndex;
      const project = projects[displayIndex];
      this.shadowRoot.querySelector('.count').textContent = `${String(displayIndex + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
      this.shadowRoot.querySelector('.title').textContent = project.title;
      const link = this.shadowRoot.querySelector('.case-link');
      link.href = project.href;
      link.setAttribute('aria-label', `View ${project.title} case study`);
    }
    this.requestPreviewUpdate();
  }

  goTo(index, { instant = false, announce = false } = {}) {
    this.stopAnimation();
    clearTimeout(this.timer);
    this.target = this.position + distance(wrap(index), this.position);
    if (instant || this.motion.matches) {
      this.position = this.target;
      this.velocity = 0;
      this.render();
      if (announce) this.announce();
      this.schedule();
      return;
    }
    // A spring lets a new drag interrupt rotation without discarding velocity.
    // mass 1, stiffness 100, damping 10; only transforms change during motion.
    this.rotating = true;
    let lastTime;
    const tick = time => {
      const dt = lastTime === undefined ? 1 / 60 : Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;
      const acceleration = -100 * (this.position - this.target) - 10 * this.velocity;
      this.velocity += acceleration * dt;
      this.position += this.velocity * dt;
      const settled = Math.abs(this.position - this.target) < .001 && Math.abs(this.velocity) < .01;
      if (settled) { this.position = this.target; this.velocity = 0; }
      this.render();
      if (settled) {
        this.animationFrame = null;
        this.rotating = false;
        if (announce) this.announce();
        this.schedule();
      } else this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  }

  stopAnimation() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.rotating = false;
  }

  startDrag(event) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    this.stopAnimation();
    clearTimeout(this.timer);
    this.dragging = true;
    this.drag = { id:event.pointerId, x:event.clientX, y:event.clientY, position:this.position, time:event.timeStamp, lastX:event.clientX, moved:false };
  }

  moveDrag(event) {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) return;
      drag.moved = true;
      this.track.setPointerCapture(event.pointerId);
      this.track.classList.add('dragging');
    }
    const spacing = this.cardWidth + PREVIEW_GAP;
    const dt = Math.max(8, event.timeStamp - drag.time) / 1000;
    this.velocity = clamp(-(event.clientX - drag.lastX) / spacing / dt, -6, 6);
    this.position = drag.position - dx / spacing;
    drag.time = event.timeStamp;
    drag.lastX = event.clientX;
    this.render();
  }

  endDrag(event) {
    if (!this.drag || event.pointerId !== this.drag.id) return;
    const drag = this.drag;
    this.drag = null;
    this.dragging = false;
    this.track.classList.remove('dragging');
    if (this.track.hasPointerCapture(event.pointerId)) this.track.releasePointerCapture(event.pointerId);
    if (drag.moved) {
      this.ignoreClickUntil = Date.now() + 400;
      if (event.timeStamp - drag.time > 100) this.velocity = 0;
      const target = Math.round(this.position + clamp(this.velocity * .15, -.7, .7));
      this.goTo(target, { announce:true });
    } else {
      // A tap can interrupt rotation; still settle the gallery onto a project.
      this.goTo(Math.round(this.position));
    }
  }

  requestPreviewUpdate() {
    if (this.previewFrame || !this.isConnected) return;
    this.previewFrame = requestAnimationFrame(() => {
      this.previewFrame = null;
      this.updatePreviewPlayback();
    });
  }

  updatePreviewPlayback() {
    const viewport = window.visualViewport;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    this.previews.forEach(({ card, image }, i) => {
      const project = projects[i];
      if (!project.poster) return;
      // Most frames need no layout reads: only a playing candidate needs bounds.
      const candidate = !document.hidden && !this.motion.matches &&
        (this.mobilePreview.matches ? i === this.index && Math.abs(distance(i, this.position)) < .06 : this.hoveredPreviews.has(i) && card.matches(':hover'));
      if (!candidate) {
        if (image.getAttribute('src') !== project.poster) image.setAttribute('src', project.poster);
        return;
      }
      const rect = card.getBoundingClientRect();
      const onArc = Math.abs(distance(i, this.position)) * 36 < 88;
      const visible = onArc && rect.bottom > top && rect.top < top + height && rect.right > left && rect.left < left + width;
      const centered = i === this.index && Math.abs(distance(i, this.position)) < .06 && Math.abs(rect.left + rect.width / 2 - centerX) <= 24 && rect.top <= centerY && rect.bottom >= centerY;
      const play = !document.hidden && !this.motion.matches && visible &&
        (this.mobilePreview.matches ? centered : this.hoveredPreviews.has(i) && card.matches(':hover'));
      const source = play ? project.image : project.poster;
      if (image.getAttribute('src') !== source) image.setAttribute('src', source);
    });
  }

  announce() {
    this.shadowRoot.querySelector('.status').textContent = `${projects[this.index].title}, project ${this.index + 1} of ${projects.length}`;
  }

  updatePause() {
    const stopped = this.paused || this.motion.matches;
    this.pauseButton.disabled = this.motion.matches;
    this.pauseButton.setAttribute('aria-label', this.motion.matches ? 'Autoplay off: reduced motion enabled' : stopped ? 'Play autoplay' : 'Pause autoplay');
    this.pauseButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${stopped ? '<path d="m9 5 10 7-10 7Z"/>' : '<path d="M9 5v14M15 5v14"/>'}</svg>`;
  }

  schedule() {
    clearTimeout(this.timer);
    if (!this.isConnected || this.paused || this.motion.matches || this.hovered || this.focused || this.dragging || this.rotating || !this.inView || document.hidden) return;
    this.timer = setTimeout(() => this.goTo(this.index + 1), 5000);
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.abort = null;
    this.observer?.disconnect();
    this.resize?.disconnect();
    this.stopAnimation();
    clearTimeout(this.timer);
    cancelAnimationFrame(this.previewFrame);
    this.previewFrame = null;
    this.drag = null;
    this.dragging = false;
  }
}

if (!customElements.get('project-carousel')) customElements.define('project-carousel', ProjectCarousel);
