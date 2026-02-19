/**
 * app.js — Main entry point
 * Initialises navigation toggle, form handler, and section handling.
 * Feature modules imported as they become available across milestones.
 */

import { initFormHandler } from './form-handler.js';

/* ========== Navigation Toggle ========== */
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
  });

  // Close nav when a link is clicked (mobile)
  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    }
  });
}

/* ========== Active Nav Link ========== */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

function updateActiveNav() {
  const scrollPos = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ========== Close nav on Escape ========== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
      navToggle.focus();
    }
  }
});

/* ========== Initialise Modules ========== */
initFormHandler();
