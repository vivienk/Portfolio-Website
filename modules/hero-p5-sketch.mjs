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
// Tuning values below are the exact props the Framer instance was using
// (found in the bundle's JSX call site), not the component's own defaults —
// keeps this a faithful port, not a redesign.
const MAX_POINTS = 1000;
const SCALE_BOOST = 1.25;
const GLOW = 200;
const MESH_DETAIL = 3;
const SHOW_PRIMITIVES = true;
const SHOW_PARTICLES = true;

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

// A single dust-mote particle: velocity/acceleration physics, fading alpha,
// rendered as a soft circle.
class Particle {
  constructor(t, vx, vy) {
    this.t = t;
    this.vx = vx;
    this.vy = vy;
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
    this.vel.limit(.115);
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

class HeroP5Sketch extends HTMLElement {
  connectedCallback() {
    if (this.p5Instance) return;
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.background = '#000';
    loadP5().then(() => this.mount()).catch(() => {});
  }

  mount() {
    if (!this.isConnected || this.p5Instance || !window.p5) return;
    const host = this;

    const sketch = t => {
      // Lorenz attractor state, and the particle field. Local to this
      // sketch instance, not shared with any other mounted copy.
      let n = .01, i = 0, a = 0;
      const points = [];
      const particles = [];
      // Eased camera position: mouseX/mouseY snapping the camera straight
      // to their mapped value every frame is what reads as glitchy/jumpy,
      // especially now that the eyeX swing is wider than it used to be —
      // easing toward the target each frame smooths that out regardless of
      // frame rate. null until the first frame, so it starts at the target
      // instead of easing in from (0,0).
      let camEyeX = null, camEyeY = null;

      t.setup = () => {
        t.createCanvas(Math.max(1.5, window.innerWidth), Math.max(1.5, host.clientHeight), t.WEBGL);
        t.colorMode(t.HSB, 360, 100, 100, 255);
        t.frameRate(30);
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

        t.translate(0, 0, -.35 * r * u);
        t.background(0);

        // The spinning torus/cylinder, enlarged 25% over the original size.
        // Stays on the shared, mouse-driven camera the Lorenz trail sets up
        // later in this same draw() (one frame behind) — that's what makes
        // it track the cursor. topExtra/2 nudges it back down by roughly
        // half the canvas's added height so it still lands close to its
        // pre-extension position; not pixel-exact against a moving camera,
        // but the object already isn't static, so an approximation here is
        // the right trade for staying cheap and simple.
        if (SHOW_PRIMITIVES) {
          const primitiveScale = 1.25;
          t.push();
          t.translate(0, -r * .32 * u + topExtra / 2, 0);
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
          const p1 = new Particle(t, t.random(20, 47), t.random(32, 24));
          p1.loc.set(sp.x, sp.y);
          const p2 = new Particle(t, t.random(-700, 700), t.random(700, -700));
          p2.loc.set(sp.x, sp.y);
          const p3 = new Particle(t, t.random(-700, 700), t.random(700, -700));
          p3.loc.set(sp.x, sp.y);
          particles.push(p1, p2, p3);

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
        // MAX_POINTS, set up the big mouse-driven parallax camera, draw the
        // glowing multi-pass stroke.
        const g = .017;
        const dn = 9 * (i - n) * g;
        const di = (n * (27 - a) - i) * g;
        const da = (n * i - 3 * a) * g;
        n += dn; i += di; a += da;
        points.push(t.createVector(n, i, a));
        if (points.length > MAX_POINTS) points.shift();

        t.translate(0, 0, -.12 * r * u);
        const targetEyeX = t.map(t.mouseX, 0, t.width, -(t.width > 809 ? t.width * 2.75 : r * 3.25), t.width > 809 ? t.width * 2.75 : r * 3.25);
        const targetEyeY = t.map(t.mouseY, 0, t.height, -(t.width > 809 ? effectiveHeight * 1 : r * 1.625), t.width > 809 ? effectiveHeight * 1 : r * 1.625);
        camEyeX = camEyeX === null ? targetEyeX : camEyeX + (targetEyeX - camEyeX) * .1;
        camEyeY = camEyeY === null ? targetEyeY : camEyeY + (targetEyeY - camEyeY) * .1;
        t.camera(
          camEyeX,
          camEyeY,
          effectiveHeight / 2 / t.tan(t.PI * 30 / 180), 0, 0, 0, 0, 1, 0
        );
        t.scale(d);
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

    this.p5Instance = new window.p5(sketch, this);

    const resizeToWindow = () => {
      if (!this.p5Instance) return;
      try {
        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, host.clientHeight);
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

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    try { this.p5Instance?.remove(); } catch {}
    this.p5Instance = null;
  }
}

if (!customElements.get('hero-p5-sketch')) customElements.define('hero-p5-sketch', HeroP5Sketch);
