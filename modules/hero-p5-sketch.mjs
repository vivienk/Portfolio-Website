// Standalone replacement for the hero's p5.js background. This used to be a
// Framer code component (React + property-controls) whose useEffect loaded
// p5.js and created the WEBGL sketch — the torus/cylinder, the particles,
// and a Lorenz-attractor trail line. That component's usage site in the
// bundle was swapped for a plain placeholder div (see
// cRmGhNP0mvrHJ1ka19RtTsqnkk2uVbV0_ZD6cy9jVPM.36hf1So1.mjs, the `p(pn,{...})`
// call) so the original never mounts and never runs its own (costly, WEBGL)
// render loop — this module owns the sketch entirely now, as a plain custom
// element with no React/Framer involvement. hero-p5-sketch-init.mjs mounts
// it into that placeholder.
//
// Two entirely different sketches live here now: the original dark-theme
// one (WEBGL torus/cylinder + particles + Lorenz trail) and a 2D light-
// theme one (a drifting Perlin-noise tile grid, ported from a plain
// global-mode sketch the site's light theme was designed around). Which
// one mounts is decided by the current theme (see theme.mjs) at mount()
// time; a theme change tears the whole p5 instance down and remounts with
// the other sketch rather than trying to hot-swap draw loops in place —
// they don't share enough (2D vs WEBGL, different state) to make that
// worthwhile.
//
// The core tuning values below come from the Framer instance's JSX call
// site; the named entrance constants tune the first-load composition.
import { getTheme, onThemeChange } from './theme.mjs';

const MAX_POINTS = 1000;
const SCALE_BOOST = 1.25;
const GLOW = 200;
const MESH_DETAIL = 3;
const SHOW_PRIMITIVES = true;
const SHOW_PARTICLES = true;
const LORENZ_SETTLE_STEPS = 100;
const LORENZ_BUILD_STEPS_PER_FRAME = 6;
const PARTICLE_BURST_MS = 1600;
const PARTICLE_BURST_COUNT = 7;
const PARTICLE_STEADY_COUNT = 3;
const PARTICLE_BURST_SPEED = .8;
const PARTICLE_STEADY_SPEED = .115;
// Multiplies the desktop torus/trail camera-orbit ranges (mobile always
// uses 1, i.e. its own un-scaled range). Was .05 — camera eyeX/eyeY only
// swung a few dozen units across the full cursor range, ~30px of visible
// movement on the trail, which read as "cursor tracking isn't working".
// .3 was tuned by sweeping the cursor corner-to-corner and checking both
// the actual camera() eye values (confirmed a real ~1100-unit swing) and
// the rendered pixels' bounding box at each extreme (confirmed neither
// shape swings off-canvas or past the top-edge safety margin). 1 (no
// damping) was tried first and does swing too far off-canvas at the
// extremes — .3 is the point that's clearly responsive without that.
const DESKTOP_ORBIT_DEPTH = .3;
// Light-theme noise grid: tile count and Perlin-noise sample step, as
// given. tileCount=100 over a full-window 2D canvas is ~10k rect() calls
// a frame — verified smooth in testing; revisit if it reads as janky on
// lower-end hardware.
const LIGHT_TILE_COUNT = 100;
const LIGHT_NOISE_SCALE = .05;
const LIGHT_TIME_STEP = .01;

const P5_SRC = '/assets/633bf41a4197efcc-p5.min.js';
let p5LoadPromise = null;
function loadP5() {
  if (window.p5) return Promise.resolve();
  if (p5LoadPromise) return p5LoadPromise;
  p5LoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = P5_SRC;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return p5LoadPromise;
}

// A single dust-mote particle: velocity/acceleration physics with a
// per-particle speed cap, fading alpha, rendered as a soft circle.
class Particle {
  constructor(t, vx, vy, speedLimit = PARTICLE_STEADY_SPEED) {
    this.t = t;
    this.vx = vx;
    this.vy = vy;
    this.speedLimit = speedLimit;
    this.num = 255;
    this.a = 255;
    this.loc = t.createVector(t.width / 2, t.height / 2);
    this.vel = t.createVector(0, 0);
    this.acc = t.createVector(1, 1);
  }
  update() {
    const t = this.t;
    this.vel.add(this.acc);
    this.loc.add(this.vel);
    this.acc.mult(0);
    this.vel.limit(this.speedLimit);
    this.acc = t.createVector(
      t.sin(t.radians(this.vx + this.num / 2)) / 2,
      t.cos(t.radians(this.vy - this.num / 2)) / 2
    );
    this.a -= .1;
  }
  isOutside() {
    const t = this.t;
    return this.loc.x < 0 || this.loc.x > t.width || this.loc.y < 0 || this.loc.y > t.height;
  }
  display() {
    const t = this.t;
    t.noStroke();
    t.fill(255, this.a * .85);
    const size = t.map(this.a, 255, 0, .5, 4) * 2;
    t.ellipse(this.loc.x, this.loc.y, size);
  }
}

// Torus/cylinder + particles + Lorenz trail, WEBGL. Everything below is
// unchanged behavior from before the light/dark split — just lifted into
// its own function so mount() can choose between this and the light
// sketch.
function buildDarkSketch(host) {
  return t => {
    // Lorenz attractor state, and the particle field. Local to this
    // sketch instance, not shared with any other mounted copy.
    let n = .01, i = 0, a = 0;
    const points = [];
    const particles = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // One integration step, shared by the real per-frame update in
    // draw() and the warm-up loop in setup() below — kept in one place
    // so they can't drift apart. .017 * .75 = .01275: the trail now
    // advances 25% less per step, i.e. animates 25% slower, on both
    // breakpoints (this isn't gated by isDesktop like the camera/size
    // tuning elsewhere — it affects the shared stepLorenz() used by
    // both the setup() warm-up and the real per-frame update).
    const LORENZ_G = .01275;
    function stepLorenz() {
      const dn = 9 * (i - n) * LORENZ_G;
      const di = (n * (27 - a) - i) * LORENZ_G;
      const da = (n * i - 3 * a) * LORENZ_G;
      n += dn; i += di; a += da;
    }
    // Both breakpoints use eased camera orbits. Desktop's orbit is kept
    // deliberately shallow so the perspective reads as 3D without
    // making either form collapse into the distance.
    let camEyeX = null, camEyeY = null;
    let camTorusX = null;
    let hasPointerInput = false;
    let pointerX = 0, pointerY = 0;

    t.setup = () => {
      t.createCanvas(Math.max(1.5, window.innerWidth), Math.max(1.5, host.clientHeight), t.WEBGL);
      const trackPointer = event => {
        const bounds = host.getBoundingClientRect();
        pointerX = event.clientX - bounds.left;
        pointerY = event.clientY - bounds.top;
        hasPointerInput = true;
      };
      host._pointerMoveHandler = trackPointer;
      window.addEventListener('pointermove', trackPointer, { passive: true });
      t.colorMode(t.HSB, 360, 100, 100, 255);
      t.frameRate(30);
      // Advance past the near-zero seed without drawing it, then let the
      // visible trail build in draw(). Reduced-motion visitors get the
      // completed curve immediately instead of the growing entrance.
      for (let step = 0; step < LORENZ_SETTLE_STEPS; step++) stepLorenz();
      const initialPointCount = reduceMotion ? MAX_POINTS : 1;
      for (let step = 0; step < initialPointCount; step++) {
        stepLorenz();
        points.push(t.createVector(n, i, a));
      }
    };

    t.draw = () => {
      // Desktop's .framer-w3gto7 CSS now extends 137px further up (80px
      // of section padding + the 57px this canvas used to be shifted
      // down by) to close the gap above the hero background — see
      // index.html. That makes the canvas 137px taller, which would
      // otherwise both enlarge (bigger r) and reposition everything below.
      // effectiveHeight backs that growth out of the size math so r (and
      // the particle spawn point, via the +topExtra below) stay exactly
      // as they were pre-extension; the torus/cylinder handle it their
      // own way (see SHOW_PRIMITIVES below). Only the mouse-driven Lorenz
      // camera, never pinned to begin with, gets to use the extra
      // headroom.
      const topExtra = t.width > 809 ? 137 : 0;
      const effectiveHeight = t.height - topExtra;
      const r = Math.min(t.width, effectiveHeight);
      const u = SCALE_BOOST;
      const d = r * .007 * u;
      // t.mouseX/t.mouseY can be undefined (not 0) before the first real
      // pointer event on some touch browsers — feeding that into t.map()
      // produces NaN, which makes camera()'s position NaN, which makes
      // nothing render at all (a blank canvas) until the first touch.
      // Guarding here fixes that, and also pins down exactly what "no
      // interaction yet" means for the torus's rest position below.
      const mouseX = Number.isFinite(t.mouseX) ? t.mouseX : 0;
      const mouseY = Number.isFinite(t.mouseY) ? t.mouseY : 0;
      const isDesktop = t.width > 809;
      const useDesktopRestCamera = isDesktop && !hasPointerInput;
      const cameraMouseX = useDesktopRestCamera ? t.width / 2 : (isDesktop ? pointerX : mouseX);
      const cameraMouseY = useDesktopRestCamera ? t.height / 2 : (isDesktop ? pointerY : mouseY);
      const boundedMouseX = t.constrain(cameraMouseX, 0, t.width);
      const boundedMouseY = t.constrain(cameraMouseY, 0, t.height);

      t.translate(0, 0, -.0875 * r * u);
      t.background(0);

      // The desktop primitive starts above-left of "VIVIEN's". Its
      // shallow X-only desktop camera restores the 3D cursor response
      // while keeping the apparent size within a safe range. Mobile
      // retains its wider original orbit. primitiveScale was .5 on
      // desktop (read as too small), then 1 (read as too big) — .85 (a
      // 15% reduction from 1) is the current tuned value.
      if (SHOW_PRIMITIVES) {
        const primitiveScale = isDesktop ? .85 : 1.25;
        // Same orbit formula as mobile, uniformly depth-capped on desktop.
        const torusEyeXRange = r * 4.25 * (isDesktop ? DESKTOP_ORBIT_DEPTH : 1);
        const torusTargetEyeX = reduceMotion
          ? 0
          : t.map(isDesktop ? boundedMouseX : cameraMouseX, 0, t.width, -torusEyeXRange, torusEyeXRange);
        camTorusX = camTorusX === null ? torusTargetEyeX : camTorusX + (torusTargetEyeX - camTorusX) * .135;
        const torusOffsetX = isDesktop ? -t.width * .22 : -t.width * 1.3;
        const torusOffsetY = isDesktop ? (-r * .32 * u + topExtra / 2 + 80) : (-r * .7 * u);
        t.push();
        t.resetMatrix();
        t.camera(camTorusX, 0, effectiveHeight / 2 / t.tan(t.PI * 30 / 180), 0, 0, 0, 0, 1, 0);
        t.translate(0, 0, -.0875 * r * u);
        t.translate(torusOffsetX, torusOffsetY, 0);
        t.rotateY(t.millis() / 1e3);
        t.cylinder(r * .12 * u * primitiveScale, r * .04 * u * primitiveScale, Math.max(3, MESH_DETAIL), .3);
        t.torus(r * .04 * u * primitiveScale, r * .06 * u * primitiveScale, Math.max(3, MESH_DETAIL), 13);
        t.rotateX(t.millis() / -9e3);
        t.pop();
      }

      // Dust-mote particles: fixed camera (not mouse-driven), spawn near
      // .hero-name (falls back to canvas center), own render pass.
      if (SHOW_PARTICLES) {
        // Always canvas-center. (The original Framer version tried to
        // spawn from .hero-name's live position, but a variable-shadowing
        // bug in that code meant the lookup always threw and silently
        // fell back to center — center was the actual behavior the whole
        // time, so that's what this keeps.)
        const sp = { x: t.width / 2, y: effectiveHeight / 2 + topExtra };
        const isOpeningBurst = !reduceMotion && t.millis() < PARTICLE_BURST_MS;
        const particleCount = isOpeningBurst ? PARTICLE_BURST_COUNT : PARTICLE_STEADY_COUNT;
        const speedLimit = isOpeningBurst ? PARTICLE_BURST_SPEED : PARTICLE_STEADY_SPEED;
        for (let index = 0; index < particleCount; index++) {
          const isGentleParticle = index === 0;
          const particle = new Particle(
            t,
            isGentleParticle ? t.random(20, 47) : t.random(-700, 700),
            isGentleParticle ? t.random(24, 32) : t.random(-700, 700),
            speedLimit
          );
          particle.loc.set(sp.x, sp.y);
          particles.push(particle);
        }

        t.push();
        t.resetMatrix();
        t.camera(0, 0, t.height / 2 / t.tan(t.PI * 30 / 180), 0, 0, 0, 0, 1, 0);
        t.translate(-t.width / 2, -t.height / 2);
        for (let e = particles.length - 1; e > 0; e--) {
          const particle = particles[e];
          particle.update();
          particle.display();
          if (particle.isOutside() || particle.a <= -1) particles.splice(e, 1);
        }
        t.pop();
      }

      // Lorenz-attractor trail line: integrate the next point, trim to
      // MAX_POINTS, apply responsive parallax, and draw the glowing
      // multi-pass stroke.
      const lorenzSteps = points.length < MAX_POINTS ? LORENZ_BUILD_STEPS_PER_FRAME : 1;
      for (let step = 0; step < lorenzSteps; step++) {
        stepLorenz();
        points.push(t.createVector(n, i, a));
        if (points.length > MAX_POINTS) points.shift();
      }

      t.translate(0, 0, -.03 * r * u);
      // Preserve mobile's 2:1 X/Y camera response. Desktop applies one
      // uniform depth multiplier so the shape remains framed and legible.
      const orbitDepth = isDesktop ? DESKTOP_ORBIT_DEPTH : 1;
      const lorenzEyeXRange = r * 3.25 * orbitDepth;
      const lorenzEyeYRange = r * 1.625 * orbitDepth;
      const targetEyeX = reduceMotion
        ? 0
        : t.map(isDesktop ? boundedMouseX : cameraMouseX, 0, t.width, -lorenzEyeXRange, lorenzEyeXRange);
      const targetEyeY = reduceMotion
        ? 0
        : t.map(isDesktop ? boundedMouseY : cameraMouseY, 0, t.height, -lorenzEyeYRange, lorenzEyeYRange);
      camEyeX = camEyeX === null ? targetEyeX : camEyeX + (targetEyeX - camEyeX) * .1125;
      camEyeY = camEyeY === null ? targetEyeY : camEyeY + (targetEyeY - camEyeY) * .1125;
      t.camera(
        camEyeX,
        camEyeY,
        effectiveHeight / 2 / t.tan(t.PI * 30 / 180), 0, 0, 0, 0, 1, 0
      );
      // On desktop the curve starts to the right, below "LAB"; the
      // translation happens before its local geometry scale. Desktop's
      // scale multiplier was .35 (read as too small) — .7 was verified
      // via the rendered pixels' bounding box to stay well clear of the
      // torus (no collision) and the top-edge safety margin.
      t.translate(
        t.width * (isDesktop ? .18 : .1),
        isDesktop ? effectiveHeight * .1 : 0,
        0
      );
      t.scale(d * (isDesktop ? .7 : 1));
      t.noFill();
      for (let layer = 2; layer >= 0; layer--) {
        const strokeAlpha = t.map(layer, .5, 0, 40, GLOW);
        const weight = layer === 0 ? .7 : t.map(layer, 3, 1.72, 1.2, .57);
        t.strokeWeight(weight);
        t.beginShape();
        let hue = 0;
        for (const pt of points) {
          t.stroke(hue, 25, 255, strokeAlpha);
          t.vertex(pt.x, pt.y, pt.z);
          hue = (hue + 1) % 256;
        }
        t.endShape();
      }
    };
  };
}

// Light theme: a drifting field of Perlin-noise-shaded tiles, 2D (not
// WEBGL — there's no 3D content here). Ported from a plain global-mode
// sketch; behaviorally identical (same noise sampling per tile, same time
// step) but draws tiles directly instead of allocating a Tile object per
// cell per frame, since the original grid array was rebuilt from scratch
// every frame anyway and never read outside that frame.
function buildLightSketch(host) {
  return t => {
    let noiseTime = 0;

    t.setup = () => {
      t.createCanvas(Math.max(1.5, window.innerWidth), Math.max(1.5, host.clientHeight));
    };

    t.draw = () => {
      t.background(150, 180, 255);
      const tileSize = t.width / LIGHT_TILE_COUNT;
      // LIGHT_TILE_COUNT defines the horizontal density. Reusing it as
      // the row count only paints a square, so portrait mobile canvases
      // reveal the flat background below that square as a hard cutoff.
      // Draw enough rows for the real canvas height (plus one overscan
      // row to avoid sub-pixel gaps while the mobile viewport resizes).
      const rowCount = Math.ceil(t.height / tileSize) + 1;
      t.noStroke();
      let yNoise = noiseTime;
      for (let row = 0; row < rowCount; row++) {
        let xNoise = noiseTime;
        for (let col = 0; col < LIGHT_TILE_COUNT; col++) {
          const alpha = t.noise(xNoise, yNoise) * 255;
          t.fill(255, alpha);
          t.rect(col * tileSize, row * tileSize, tileSize, tileSize);
          xNoise += LIGHT_NOISE_SCALE;
        }
        yNoise += LIGHT_NOISE_SCALE;
      }
      noiseTime += LIGHT_TIME_STEP;
    };
  };
}

class HeroP5Sketch extends HTMLElement {
  connectedCallback() {
    // Moving an already-connected custom element (appendChild/insertBefore
    // to a new parent) fires disconnectedCallback then connectedCallback
    // again, as a side effect of the move itself — not a real
    // remove-from-page. applyLayout() sets this._reparenting around its
    // own moves so those synthetic lifecycle calls no-op here instead of
    // tearing down the p5 instance or clobbering _originalParent below
    // with the element's new (temporary) parent.
    if (this._reparenting) return;
    if (this.p5Instance) return;
    this.style.display = 'block';
    // Remembered once, on the first real connect, so the light-theme
    // layout (below) can put this element back where it started when the
    // theme flips back to dark.
    if (!this._originalParent) {
      this._originalParent = this.parentElement;
      this._originalNextSibling = this.nextSibling;
    }
    // p5.js loads async (loadP5() below), and mount() — which applies
    // layout/background and creates the canvas — only runs once that
    // resolves. Without this, there's a window (first load, or a slow
    // network) where the light-theme host isn't fixed/full-page yet and
    // has no background of its own, so every section that was made
    // transparent to share this canvas would show whatever's behind it
    // (the page root's own default paint) instead of the noise-grid blue.
    // Applying both synchronously, immediately, closes that gap; mount()
    // still re-applies them once the real canvas exists, which is a no-op
    // if nothing changed in the meantime.
    const theme = getTheme();
    this.applyLayout(theme);
    this.style.background = theme === 'light' ? 'rgb(150,180,255)' : '#000';
    this._unsubscribeTheme = onThemeChange(() => this.handleThemeChange());
    loadP5().then(() => this.mount()).catch(() => {});
  }

  handleThemeChange() {
    if (!this.p5Instance) return;
    const theme = getTheme();
    if (theme === this._mountedTheme) return;
    this.teardown();
    this.mount();
  }

  // Dark mode stays exactly where Framer put it: a normal-flow child of
  // the hero's mount point, sized to that section (host.clientHeight),
  // masked/clipped by the hero's own container CSS. Light mode instead
  // renders as a fixed, full-viewport layer living directly on <body> —
  // behind every section, not just the hero — so Projects/About Me can
  // go transparent and read as one continuous page background rather
  // than separate boxed sections. (host.clientHeight below then just
  // naturally resolves to 100vh, so buildLightSketch/resizeToWindow need
  // no changes of their own for this.)
  applyLayout(theme) {
    this._reparenting = true;
    try {
      if (theme === 'light') {
        if (this.parentElement !== document.body) document.body.appendChild(this);
        Object.assign(this.style, {
          position: 'fixed', inset: '0', width: '100vw', height: '100vh',
          zIndex: '-1', pointerEvents: 'none',
        });
        // 100vh on mobile Safari (and other browsers with a collapsing
        // address bar) is sized to the *largest* possible viewport, not
        // the one actually visible — the visible viewport shrinks as the
        // bar appears, so a plain 100vh layer can end up shorter than the
        // real, currently-visible page during/after a scroll, leaving a
        // gap at the bottom. dvh tracks the real, current viewport
        // instead; set as a second assignment (not in the object above)
        // so it only overrides 100vh on browsers that understand the
        // unit — unsupported values are rejected by the property setter,
        // silently keeping 100vh as the fallback everywhere else.
        this.style.height = '100dvh';
      } else {
        if (this._originalParent && this.parentElement !== this._originalParent) {
          this._originalParent.insertBefore(this, this._originalNextSibling);
        }
        Object.assign(this.style, {
          position: '', inset: '', width: '100%', height: '100%',
          zIndex: '', pointerEvents: '',
        });
      }
    } finally {
      this._reparenting = false;
    }
  }

  mount() {
    if (!this.isConnected || this.p5Instance || !window.p5) return;
    const theme = getTheme();
    this._mountedTheme = theme;
    this.applyLayout(theme);
    // Matches each sketch's own background() color, so there's no flash
    // of the wrong color behind the canvas while it loads/remounts.
    this.style.background = theme === 'light' ? 'rgb(150,180,255)' : '#000';
    const sketch = theme === 'light' ? buildLightSketch(this) : buildDarkSketch(this);
    this.p5Instance = new window.p5(sketch, this);

    const resizeToWindow = () => {
      if (!this.p5Instance) return;
      try {
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, this.clientHeight);
        if (this.p5Instance.width !== width || this.p5Instance.height !== height) {
          this.p5Instance.resizeCanvas(width, height);
        }
      } catch {}
    };
    this._resizeHandler = resizeToWindow;
    window.addEventListener('resize', resizeToWindow);
    this._resizeObserver = new ResizeObserver(resizeToWindow);
    this._resizeObserver.observe(this);
  }

  teardown() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    this._resizeHandler = null;
    if (this._pointerMoveHandler) window.removeEventListener('pointermove', this._pointerMoveHandler);
    this._pointerMoveHandler = null;
    try { this.p5Instance?.remove(); } catch {}
    this.p5Instance = null;
  }

  disconnectedCallback() {
    if (this._reparenting) return;
    this._unsubscribeTheme?.();
    this._unsubscribeTheme = null;
    this.teardown();
  }
}

if (!customElements.get('hero-p5-sketch')) customElements.define('hero-p5-sketch', HeroP5Sketch);
