// rot.js — GSAP-based rotating skill wheel with click-to-select behavior

// DOM
const orbit = document.getElementById('orbit');
const icons = Array.from(orbit.querySelectorAll('img'));
const titleEl = document.querySelector('.skill-title');
const descEl = document.querySelector('.skill-desc');
const glow = document.querySelector('.glow');
const body = document.body;

// Config
const COUNT = icons.length;      // 10
const RADIUS = 160;              // px
const ROT_DURATION = 24;         // seconds per full rotation
const TOP_ANGLE = -Math.PI / 2;  // angle that corresponds to top (radians)

// store base angle for each icon
icons.forEach((el, i) => {
  const angle = (i / COUNT) * Math.PI * 2;
  el._baseAngle = angle;
});

// state object animated by GSAP
const state = { angle: 0 };

// helper: position icons given a rotation angle
function positionIcons(rotationAngle) {
  icons.forEach((el, i) => {
    const a = el._baseAngle + rotationAngle;
    const x = Math.cos(a) * RADIUS;
    const y = Math.sin(a) * RADIUS;
    // rotate icon slightly outward so it doesn't appear upside-down
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) rotate(${a}rad)`;
  });
}

// compute which icon is closest to top (smallest y)
function getTopIcon(rotationAngle) {
  let top = null;
  let topY = Infinity;
  icons.forEach((el) => {
    // compute current angle & y (predictive, avoids expensive DOM reads)
    const a = el._baseAngle + rotationAngle;
    const y = Math.sin(a) * RADIUS;
    if (y < topY) { topY = y; top = el; }
  });
  return top;
}

// apply visual active state and update UI
let currentActive = null;
function applyActive(el) {
  if (!el) return;
  // data attributes
  const color = el.dataset.color || '#ffffff';
  const title = el.dataset.title || '';
  const desc = el.dataset.desc || '';

  // scale down all icons, then pop this one
  icons.forEach(i => gsap.to(i, { scale: 1, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6)) brightness(.95)", duration: 0.28 }));
  gsap.to(el, { scale: 1.35, filter: `drop-shadow(0 10px 40px ${color}) brightness(1.05)`, duration: 0.45, ease: "power2.out" });

  // glow background
  gsap.to(glow, { background: `radial-gradient(circle, ${hexToRgba(color,0.34)}, transparent 60%)`, duration: 0.6, ease: "power2.out" });
  gsap.to(body, { background: `radial-gradient(circle at center, ${hexToRgba(color,0.08)} 0%, #000 60%)`, duration: 0.9 });

  // text fade
  gsap.timeline()
    .to([titleEl, descEl], { opacity: 0, y: -8, duration: 0.18 })
    .add(() => {
      titleEl.textContent = title;
      descEl.textContent = desc;
      titleEl.style.color = color;
    })
    .to([titleEl, descEl], { opacity: 1, y: 0, duration: 0.36 }, "+=0.06");

  // track current
  currentActive = el;
}

// helper: hex to rgba
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#','');
  const bigint = parseInt(h,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// main render function called on update
function render() {
  positionIcons(state.angle);
  const top = getTopIcon(state.angle);
  if (top && top !== currentActive) {
    applyActive(top);
  }

  // set z-index so bottom icons are behind
  const sorted = [...icons].sort((a,b) => {
    const ay = Math.sin(a._baseAngle + state.angle);
    const by = Math.sin(b._baseAngle + state.angle);
    return ay - by;
  });
  sorted.forEach((el, idx) => el.style.zIndex = idx + 1);
}

// continuous rotation tween
const loop = gsap.to(state, {
  angle: Math.PI * 2,
  duration: ROT_DURATION,
  ease: "none",
  repeat: -1,
  onUpdate: render
});

// initial position + apply first active
render();
applyActive(getTopIcon(state.angle)); // initial active

// click to bring clicked icon to top
icons.forEach(icon => {
  icon.addEventListener('click', () => {
    // compute target global angle so icon reaches TOP_ANGLE
    const target = TOP_ANGLE - icon._baseAngle; // new state.angle should equal target
    // normalize current and target to make shortest path
    const current = state.angle % (Math.PI*2);
    let delta = target - current;
    delta = ((delta + Math.PI*2) % (Math.PI*2));
    if (delta > Math.PI) delta -= Math.PI*2;

    // animate by adding delta to current state.angle (smooth)
    loop.pause();
    gsap.to(state, {
      angle: state.angle + delta,
      duration: 0.9,
      ease: "power2.inOut",
      onUpdate: render,
      onComplete: () => {
        // after settled, ensure active applied (render handles it)
        loop.resume();
      }
    });
  });
});
