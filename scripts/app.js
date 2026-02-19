/**
 * app.js
 * This is the main file that makes everything work together.
 */

import { initFormHandler, loadForEdit } from './form-handler.js';
import * as state from './state.js';
import * as storage from './storage.js';
import * as ui from './ui.js';
import { matchesSearch } from './search.js';

/* --- Elements for Search and Sort --- */
const searchInput = document.getElementById('search-input');
const caseToggle = document.getElementById('case-toggle');
const sortButtons = document.querySelectorAll('.btn--sort');

/* --- Elements for Settings --- */
const pagesPerHourInput = document.getElementById('setting-pages-per-hour');
const targetInput = document.getElementById('setting-target');

/* --- Elements for Data --- */
const exportBtn = document.getElementById('btn-export');
const importInput = document.getElementById('btn-import');

/* --- Delete Modal Elements --- */
const deleteModal = document.getElementById('delete-modal');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
let bookToDelete = null;

/** Refresh the screen with latest data */
function refreshUI() {
  const books = state.getBooks();
  const settings = state.getSettings();
  const search = state.getSearchState();

  // Filter books based on search
  const filteredBooks = books.filter(b => matchesSearch(b, search.query, search.isCaseSensitive));

  // Sort books
  filteredBooks.sort((a, b) => {
    let valA = a[settings.sortField];
    let valB = b[settings.sortField];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (settings.sortDirection === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  ui.renderRecords(filteredBooks, search.query, search.isCaseSensitive, handleEdit, askToDelete);
  ui.renderStats(books, settings);
}

/** Save data and update UI */
function handleDataChange() {
  storage.saveBooks(state.getBooks());
  refreshUI();
}

/** Open the form to edit a book */
function handleEdit(book) {
  loadForEdit(book);
  window.scrollTo({ top: document.getElementById('add-form').offsetTop - 100, behavior: 'smooth' });
}

/** Show the delete popup */
function askToDelete(id) {
  bookToDelete = id;
  deleteModal.hidden = false;
}

/* --- Setup Buttons and Inputs --- */

function initApp() {
  // Load data from browser
  const savedBooks = storage.loadBooks();
  state.setBooks(savedBooks);

  const savedSettings = storage.loadSettings();
  if (savedSettings) state.updateSettings(savedSettings);

  // Search input
  searchInput.addEventListener('input', () => {
    state.updateSearch(searchInput.value, caseToggle.getAttribute('aria-pressed') === 'true');
    refreshUI();
  });

  // Case sensitive button
  caseToggle.addEventListener('click', () => {
    const isPressed = caseToggle.getAttribute('aria-pressed') === 'true';
    caseToggle.setAttribute('aria-pressed', !isPressed);
    state.updateSearch(searchInput.value, !isPressed);
    refreshUI();
  });

  // Sort buttons
  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.sort;
      const currentSettings = state.getSettings();
      let direction = 'asc';

      if (currentSettings.sortField === field) {
        direction = currentSettings.sortDirection === 'asc' ? 'desc' : 'asc';
      }

      state.updateSettings({ sortField: field, sortDirection: direction });

      // Update button looks
      sortButtons.forEach(b => {
        b.classList.remove('active');
        b.querySelector('.sort-arrow').textContent = '';
      });
      btn.classList.add('active');
      btn.querySelector('.sort-arrow').textContent = direction === 'asc' ? '▲' : '▼';

      refreshUI();
    });
  });

  // Settings inputs
  pagesPerHourInput.addEventListener('change', () => {
    state.updateSettings({ pagesPerHour: parseInt(pagesPerHourInput.value, 10) });
    storage.saveSettings(state.getSettings());
    refreshUI();
  });

  targetInput.addEventListener('change', () => {
    state.updateSettings({ target: parseInt(targetInput.value, 10) });
    storage.saveSettings(state.getSettings());
    refreshUI();
  });

  // Export and Import
  exportBtn.addEventListener('click', () => {
    storage.exportData(state.getBooks());
  });

  importInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      try {
        const newData = await storage.importData(e.target.files[0]);
        state.setBooks(newData);
        handleDataChange();
        alert('Data imported!');
      } catch (err) {
        alert(err.message);
      }
    }
  });

  // Delete Modal
  modalConfirm.addEventListener('click', () => {
    if (bookToDelete) {
      state.deleteBook(bookToDelete);
      handleDataChange();
      deleteModal.hidden = true;
      bookToDelete = null;
    }
  });

  modalCancel.addEventListener('click', () => {
    deleteModal.hidden = true;
    bookToDelete = null;
  });

  // Listen for saved books from form
  document.addEventListener('book-saved', handleDataChange);

  // Initialize form
  initFormHandler();

  // Initial draw
  refreshUI();
}

// Start the app
initApp();

/* --- Old Navigation Code --- */
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
  });
  mainNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    }
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    navToggle.focus();
  }
});
