// ---------- Theme toggle (in-memory only — resets to dark on reload) ----------
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');

themeBtn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  iconMoon.classList.toggle('hidden', isDark);
  iconSun.classList.toggle('hidden', !isDark);
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
menuBtn.addEventListener('click', () => mobileNav.classList.toggle('hidden'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.add('hidden')));

// ---------- Scroll reveal animation ----------
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// ---------- Contact form (demo only) ----------
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');
const submitLabel = document.getElementById('submit-label');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  submitLabel.textContent = 'Sent ✓';
  note.textContent = "Thanks for reaching out — this is a demo form, so nothing was actually sent.";
  form.reset();
  setTimeout(() => { submitLabel.textContent = 'Send Message'; }, 2500);
});
