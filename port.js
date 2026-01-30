// ============================
// Variables & DOM References
// ============================
var initial = `M 10 100 Q 500 100 2000 100`;
var final = `M 10 100 Q 500 100 2000 100`;
var string = document.querySelector("#string");

const track = document.getElementById("scrollTrack");
const clone = track.cloneNode(true);
track.parentElement.appendChild(clone);

const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('section');
const navlinks = document.querySelectorAll('header nav a');
const main = document.querySelector("#main");
const cursor = document.querySelector("#cursor");

// ============================
// GSAP Plugin Registration
// ============================
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

// ============================
// Horizontal Scroll Track Clone
// ============================
gsap.set(clone, { xPercent: 100, position: "absolute", top: 0, left: 0 });

const totalDuration = 10;

gsap.timeline({ repeat: -1 })
  .to(track, { xPercent: -100, duration: totalDuration, ease: "none" })
  .to(clone, { xPercent: 0, duration: totalDuration, ease: "none" }, 0)
  .set(track, { xPercent: 0 })
  .set(clone, { xPercent: 100 });

// ============================
// Cursor Interactive Path
// ============================
string.addEventListener("mousemove", function (dets) {
  initial = `M 10 100 Q ${dets.x} ${dets.y} 2000 100`;
  gsap.to("svg path", {
    attr: { d: initial },
    duration: 0.05,
    ease: "linear",
  });
});

string.addEventListener("mouseleave", function () {
  gsap.to("svg path", {
    attr: { d: final },
    duration: 0.8,
    ease: "elastic.out(1.5, 0.3)",
  });
});

// ============================
// Loader Shape Animation
// ============================
function animateShape(selector, duration = 1.5) {
  const path = document.querySelector(`${selector} path`);
  const dot = document.querySelector(`${selector} .dot`);
  const length = path.getTotalLength();

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(path, {
    strokeDashoffset: 0,
    duration,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 1,
  });

  gsap.to(dot, {
    duration,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 1,
    motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] },
  });
}

// Animate all loader shapes
animateShape(".circle");
animateShape(".triangle");
animateShape(".square");

// Loader exit + reveal main content
setTimeout(() => {
  const loader = document.querySelector(".loader-wrapper");
  loader.style.pointerEvents = "none";

  gsap.to(loader, {
    opacity: 0,
    scale: 1.2,
    duration: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      loader.style.display = "none";

      // Animate header & sections
      gsap.fromTo(".header", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" });
      gsap.to(".section", { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.3 });
    }
  });
}, 2000);

// ============================
// Project Slider (Swiper)
// ============================
new Swiper(".project-slider", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  loop: true,
  spaceBetween: 30,
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 150,
    modifier: 2,
    slideShadows: false,
  },
  pagination: { el: ".swiper-pagination", clickable: true },
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
});

// ============================
// Navigation & Mobile Menu
// ============================
function closeMobileNav() {
  navbar.classList.remove('active');
  menuIcon.classList.add('fa-bars');
  menuIcon.classList.remove('fa-xmark');
}

menuIcon?.addEventListener('click', () => {
  navbar.classList.toggle('active');
  const isOpen = navbar.classList.contains('active');
  menuIcon.classList.toggle('fa-bars', !isOpen);
  menuIcon.classList.toggle('fa-xmark', isOpen);
});

menuIcon?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    menuIcon.click();
  }
});

navlinks.forEach(link => link.addEventListener('click', closeMobileNav));

// Highlight nav link on scroll
window.addEventListener('scroll', () => {
  const top = window.scrollY;

  sections.forEach(sec => {
    const offset = sec.offsetTop - 150;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');

    if (top >= offset && top < offset + height) {
      navlinks.forEach(link => link.classList.remove('active'));
      const target = document.querySelector(`header nav a[href*="#${id}"]`);
      if (target) target.classList.add('active');
    }
  });
});

// ============================
// Custom Cursor Animation
// ============================
main.addEventListener("mousemove", (e) => {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.1,
    ease: "power2.out",
  });
});

// ============================
// GSAP Entrance Animations
// ============================
gsap.from(".logo a", { opacity: 0, duration: 1, delay: 4.5, y: -20 });
gsap.from("header nav", { opacity: 0, duration: 1, delay: 5, y: -20 });
gsap.from(".home-content, .home-img", {
  opacity: 0,
  duration: 1,
  delay: 5.5,
  y: -50,
  ease: "power2.out",
  stagger: 0.3,
});

// Education Section Scroll Animations
gsap.from(".education .heading", {
  opacity: 0,
  duration: 1,
  scrollTrigger: { trigger: ".education", start: "top 80%", scrub: 2 }
});

gsap.from(".education .timeline-item", {
  opacity: 0,
  y: 50,
  stagger: 0.3,
  duration: 1.2,
  scrollTrigger: { trigger: ".education .timeline-items", start: "top 80%", scrub: 3 }
});

// Projects Section Scroll Animation
gsap.from(".projects .heading", {
  opacity: 0,
  y: 30,
  duration: 1,
  scrollTrigger: { trigger: ".projects", start: "top 80%", scrub: 2 }
});

// 3D Robot Animation
gsap.from(".robot-3d", {
  opacity: 0,
  duration: 2.5,
  rotate: 90,
  x: -300,
  scrollTrigger: { trigger: ".robot-3d", start: "top 80%", end: "top 30%", scrub: 2 }
});

// Projects Timeline Scroll
var tl2 = gsap.timeline({
  scrollTrigger: { trigger: ".projects", scroller: "body", start: "top 50%", end: "top 10%", scrub: 2 }
});

// ============================
// Debug
// ============================
console.log("GSAP version:", gsap.version);
console.log("ScrollTrigger registered:", typeof ScrollTrigger !== "undefined");
