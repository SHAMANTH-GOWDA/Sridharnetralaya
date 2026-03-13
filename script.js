/* ============================================================
   SRIDHAR NETRALAYA – MAIN SCRIPT
   ============================================================ */

'use strict';

// ── PRELOADER ────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('hidden');
  }, 1600);
});

// ── NAVBAR SCROLL & ACTIVE LINK ──────────────────────────────
const navbar  = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled class
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Back-to-top
  const btt = document.getElementById('backToTop');
  if (btt) btt.classList.toggle('show', window.scrollY > 400);

  // Active nav
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

// ── HAMBURGER MENU ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('mobile-open');
});
navLinksEl?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('mobile-open');
  });
});

// ── HERO CANVAS FRAME ANIMATION ──────────────────────────────
(function initHeroCanvas() {
  const canvas  = document.getElementById('frameCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const TOTAL   = 240;
  const FPS     = 24;
  let   current = 0;
  let   loaded  = 0;
  const images  = [];
  let   animId  = null;

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    if (images[current]?.complete) draw(images[current]);
  }

  function draw(img) {
    if (!img || !img.complete) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    const dx = (cw - sw) / 2, dy = (ch - sh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, sw, sh);
  }

  function pad(n)  { return String(n).padStart(3, '0'); }

  let lastTime = 0;
  function animate(ts) {
    animId = requestAnimationFrame(animate);
    if (ts - lastTime < 1000 / FPS) return;
    lastTime = ts;
    draw(images[current]);
    current = (current + 1) % TOTAL;
  }

  // Preload all frames
  for (let i = 1; i <= TOTAL; i++) {
    const img = new Image();
    img.src   = `assets/images/ezgif-frame-${pad(i)}.jpg`;
    img.onload = () => {
      loaded++;
      if (loaded === 1) { resize(); animate(0); } // start on first load
    };
    img.onerror = () => { loaded++; };
    images[i - 1] = img;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
})();

// ── COUNTER ANIMATION ────────────────────────────────────────
function animateCounter(el) {
  const target   = +el.dataset.target;
  const duration = 2000;
  const step     = 16;
  const increment = target / (duration / step);
  let val = 0;
  const timer = setInterval(() => {
    val = Math.min(val + increment, target);
    el.textContent = Math.round(val).toLocaleString();
    if (val >= target) clearInterval(timer);
  }, step);
}

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Staggered children
    if (el.dataset.stagger) {
      const children = el.querySelectorAll('[class*="reveal"]');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
    }

    el.classList.add('visible');

    // Counter
    const counters = el.querySelectorAll('.stat-number');
    counters.forEach(c => animateCounter(c));

    revealObserver.unobserve(el);
  });
}, { threshold: 0.12 });

// Observe all reveal elements
function setupReveal() {
  // Add reveal classes where needed
  const toReveal = [
    '.about-grid',
    '.why-grid',
    '.appointment-grid',
    '.contact-grid',
    '.hero-stats',
  ];
  toReveal.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  });

  // Cards with stagger
  const cardSels = [
    '.services-grid',
    '.doctors-grid',
    '.why-cards-row',
    '.about-awards',
  ];
  cardSels.forEach(sel => {
    document.querySelectorAll(sel).forEach(parent => {
      [...parent.children].forEach((card, i) => {
        card.style.transitionDelay = `${i * 80}ms`;
        card.classList.add('reveal');
        revealObserver.observe(card);
      });
    });
  });

  // Gallery
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 60}ms`;
    item.classList.add('reveal');
    revealObserver.observe(item);
  });

  // Section headers
  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// ── TESTIMONIALS SLIDER ──────────────────────────────────────
(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const cards    = track.querySelectorAll('.testimonial-card');
  const total    = cards.length;
  const dotsWrap = document.getElementById('tDots');
  let   current  = 0;
  let   perView  = window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;
  let   autoPlay;

  // Create dots
  function createDots() {
    dotsWrap.innerHTML = '';
    const count = Math.ceil(total / perView);
    for (let i = 0; i < count; i++) {
      const d = document.createElement('button');
      d.className = `tDot${i === 0 ? ' active' : ''}`;
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, Math.ceil(total / perView) - 1));
    const cardW = cards[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${current * cardW * perView}px)`;
    dotsWrap.querySelectorAll('.tDot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo((current + 1) % Math.ceil(total / perView)); }
  function prev() { goTo((current - 1 + Math.ceil(total / perView)) % Math.ceil(total / perView)); }

  document.getElementById('tNext')?.addEventListener('click', () => { resetAuto(); next(); });
  document.getElementById('tPrev')?.addEventListener('click', () => { resetAuto(); prev(); });

  function startAuto() { autoPlay = setInterval(next, 4500); }
  function resetAuto()  { clearInterval(autoPlay); startAuto(); }

  function handleResize() {
    const newPerView = window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;
    if (newPerView !== perView) { perView = newPerView; current = 0; createDots(); goTo(0); }
  }

  createDots();
  startAuto();
  window.addEventListener('resize', handleResize, { passive: true });

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });
})();

// ── APPOINTMENT FORM ─────────────────────────────────────────
const form = document.getElementById('appointmentForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');

  btn.disabled = true;
  btn.innerHTML = '<span>Processing...</span>';

  // Simulate API call
  setTimeout(() => {
    btn.innerHTML = '<span>✓ Appointment Requested</span>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    success.removeAttribute('hidden');
    form.reset();

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<span>Confirm Appointment</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      btn.style.background = '';
    }, 4000);
  }, 1500);
});

// ── MIN DATE FOR APPOINTMENT ─────────────────────────────────
const dateInput = document.getElementById('apptDate');
if (dateInput) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ── BACK TO TOP ──────────────────────────────────────────────
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── SERVICE CARD GLOW ON HOVER ───────────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

// ── SMOOTH NAV SCROLL ────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupReveal();
  onScroll();
});
