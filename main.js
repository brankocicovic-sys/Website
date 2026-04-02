/* ============================================================
   SHOPVIEW LANDING PAGE — main.js
   ============================================================ */

// ── App Demo — auto-cycling tabs ─────────────────────────────
const appTabs      = document.querySelectorAll('.app-demo__tab');
const screenshot   = document.getElementById('app-demo-screenshot');
const screenshotImg = document.getElementById('app-demo-img');
const TAB_DURATION = 10000; // ms

// One image per tab — replace URLs when you have separate screenshots
const TAB_IMAGES = [
  'https://www.figma.com/api/mcp/asset/e11b9222-5460-453b-9338-1fb26ccf5145', // Work Orders
  'https://www.figma.com/api/mcp/asset/e11b9222-5460-453b-9338-1fb26ccf5145', // Schedule
  'https://www.figma.com/api/mcp/asset/e11b9222-5460-453b-9338-1fb26ccf5145', // Customers
  'https://www.figma.com/api/mcp/asset/e11b9222-5460-453b-9338-1fb26ccf5145', // Parts
  'https://www.figma.com/api/mcp/asset/e11b9222-5460-453b-9338-1fb26ccf5145', // Reports
];

let currentIndex  = 0;
let cycleTimer    = null;
let tabStartTime  = null;
let remainingTime = TAB_DURATION;
let isPaused      = false;

function activateTab(index) {
  // Deactivate all tabs and reset their progress bars
  appTabs.forEach(t => {
    t.classList.remove('app-demo__tab--active');
    const bar = t.querySelector('.tab-progress');
    bar.style.animation = 'none';
    bar.style.width = '0%';
  });

  currentIndex = index;
  remainingTime = TAB_DURATION;
  tabStartTime = Date.now();

  const tab = appTabs[index];
  tab.classList.add('app-demo__tab--active');

  // Update screenshot
  screenshotImg.src = TAB_IMAGES[index];

  // Kick off progress bar animation
  const bar = tab.querySelector('.tab-progress');
  bar.style.animation = 'none';
  bar.offsetHeight; // force reflow so animation restarts cleanly
  bar.style.animationPlayState = 'running';
  bar.style.animation = `tab-progress ${TAB_DURATION / 1000}s linear forwards`;
}

function scheduleNext() {
  clearTimeout(cycleTimer);
  cycleTimer = setTimeout(() => {
    if (!isPaused) {
      activateTab((currentIndex + 1) % appTabs.length);
      scheduleNext();
    }
  }, remainingTime);
}

// ── Tab click ───────────────────────────────────────────────
appTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    activateTab(i);
    scheduleNext();
  });
});

// ── Pause cycle while hovering over the screenshot ──────────
screenshot.addEventListener('mouseenter', () => {
  if (isPaused) return;
  isPaused = true;
  clearTimeout(cycleTimer);

  // Record how much time is left
  remainingTime = Math.max(TAB_DURATION - (Date.now() - tabStartTime), 0);

  // Freeze the progress bar visually
  const bar = appTabs[currentIndex].querySelector('.tab-progress');
  bar.style.animationPlayState = 'paused';
});

screenshot.addEventListener('mouseleave', () => {
  if (!isPaused) return;
  isPaused = false;

  // Adjust start time so elapsed = TAB_DURATION - remainingTime
  tabStartTime = Date.now() - (TAB_DURATION - remainingTime);

  // Resume progress bar from where it paused
  const bar = appTabs[currentIndex].querySelector('.tab-progress');
  bar.style.animationPlayState = 'running';

  scheduleNext();
});

// ── Boot ────────────────────────────────────────────────────
activateTab(0);
scheduleNext();

// ── Work Order feature tabs ───────────────────────────────────
document.querySelectorAll('.wo-feature__tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.wo-feature__tab').forEach(t => t.classList.remove('wo-feature__tab--active'));
    tab.classList.add('wo-feature__tab--active');
  });
});

// ── Tab interactions (Use Cases) — auto-cycling ──────────────
const useCaseTabs = document.querySelectorAll('.use-case-tab');
const USE_CASE_DURATION = 5000;
let ucCurrentIndex = 0;
let ucTimer = null;

function activateUseCaseTab(index) {
  useCaseTabs.forEach(t => t.classList.remove('use-case-tab--active'));
  ucCurrentIndex = index;
  useCaseTabs[index].classList.add('use-case-tab--active');
}

function scheduleNextUseCase() {
  clearTimeout(ucTimer);
  ucTimer = setTimeout(() => {
    activateUseCaseTab((ucCurrentIndex + 1) % useCaseTabs.length);
    scheduleNextUseCase();
  }, USE_CASE_DURATION);
}

useCaseTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => {
    activateUseCaseTab(i);
    scheduleNextUseCase();
  });
});

// Start cycling when section scrolls into view
const useCasesSection = document.querySelector('.use-cases');
let ucStarted = false;
const ucObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !ucStarted) {
      ucStarted = true;
      activateUseCaseTab(0);
      scheduleNextUseCase();
    }
  });
}, { threshold: 0.2 });
if (useCasesSection) ucObserver.observe(useCasesSection);

// ── Nav: transparent → floating pill on scroll ───────────────
const nav = document.querySelector('.nav');
const SCROLL_THRESHOLD = 80;

window.addEventListener('scroll', () => {
  if (window.scrollY > SCROLL_THRESHOLD) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }
}, { passive: true });

// ── Testimonial quote — scroll-driven gradient reveal (row by row) ───────────
const testimonialSection = document.querySelector('.testimonial');
const testimonialLine1   = document.querySelector('.testimonial__line--1');
const testimonialLine2   = document.querySelector('.testimonial__line--2');

if (testimonialSection && testimonialLine1 && testimonialLine2) {
  window.addEventListener('scroll', () => {
    const rect     = testimonialSection.getBoundingClientRect();
    const winH     = window.innerHeight;
    // overall progress 0→1 as section scrolls into view
    const progress = Math.max(0, Math.min(1,
      (winH - rect.top) / (winH * 0.7 + rect.height * 0.5)
    ));
    // Line 1 sweeps across the first 60% of scroll progress
    const p1 = Math.min(1, progress / 0.6);
    // Line 2 starts only after progress hits 60%, uses the remaining 40%
    const p2 = Math.max(0, Math.min(1, (progress - 0.6) / 0.4));

    testimonialLine1.style.setProperty('--reveal-1', `${-20 + p1 * 140}%`);
    testimonialLine2.style.setProperty('--reveal-2', `${-20 + p2 * 140}%`);
  }, { passive: true });
}

// ── Smooth reveal on scroll (intersection observer) ──────────
const revealEls = document.querySelectorAll(
  '.feature-card, .stat, .result-card, .use-case-tab, .benefit, .case-study__card'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  observer.observe(el);
});
