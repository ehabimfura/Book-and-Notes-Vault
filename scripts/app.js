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
const searchBtn = document.getElementById('btn-search-trigger');

const sortButtons = document.querySelectorAll('.btn--sort');

/* --- Elements for Settings --- */
const pagesPerHourInput = document.getElementById('setting-pages-per-hour');
const targetInput = document.getElementById('setting-target');

/* --- Elements for Data --- */
const exportBtn = document.getElementById('btn-export');
const importInput = document.getElementById('btn-import');
const baseUnitInput = document.getElementById('setting-base-unit');


/* --- Delete Modal Elements --- */
const deleteModal = document.getElementById('delete-modal');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
const targetLive = document.getElementById('target-live');
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

  ui.renderRecords(filteredBooks, search.query, search.isCaseSensitive, books.length, handleEdit, askToDelete);

  ui.renderStats(books, settings);

  // Check if reading target is reached
  if (books.length >= settings.target && settings.target > 0) {
    targetLive.textContent = "Great job! You reached your reading goal!";
  } else {
    targetLive.textContent = "";
  }
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
  let savedBooks = storage.loadBooks();

  if (savedBooks.length === 0) {
    // If no data, try to fetch from seed.json
    fetch('seed.json')
      .then(res => res.json())
      .then(data => {
        state.setBooks(data);
        storage.saveBooks(data);
        refreshUI();
      })
      .catch(err => {
        console.warn('Could not load seed data:', err);
        state.setBooks([]);
        refreshUI();
      });
  } else {
    state.setBooks(savedBooks);
  }


  const savedSettings = storage.loadSettings();
  if (savedSettings) {
    state.updateSettings(savedSettings);
    // Update UI inputs to match saved settings
    pagesPerHourInput.value = state.getSettings().pagesPerHour;
    targetInput.value = state.getSettings().target;
    baseUnitInput.value = state.getSettings().baseUnit;

    // Set initial label for reading speed
    const pphLabel = document.getElementById('setting-pph-label');
    if (pphLabel) {
      if (state.getSettings().baseUnit === 'minutes') {
        pphLabel.textContent = 'Pages per minute';
      } else {
        pphLabel.textContent = 'Pages per hour';
      }
    }
  }


  /** Internal function to trigger search */
  const triggerSearch = () => {
    state.updateSearch(searchInput.value, false);
    refreshUI();

    // Use a longer timeout and manual scroll to ensure the transition happens
    setTimeout(() => {
      const recordsSection = document.getElementById('records');
      if (recordsSection) {
        // Calculate the target position accounting for the sticky header
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
        const targetTop = recordsSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        // Update the URL hash to reflect the current section
        if (window.location.hash !== '#records') {
          history.pushState(null, null, '#records');
        }
      }
    }, 150);



  };


  // Search input: filter only on Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  });


  // Search button click
  searchBtn.addEventListener('click', () => {
    triggerSearch();
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

  baseUnitInput.addEventListener('change', () => {
    state.updateSettings({ baseUnit: baseUnitInput.value });
    storage.saveSettings(state.getSettings());

    // Update the label for reading speed based on the base unit
    const pphLabel = document.getElementById('setting-pph-label');
    if (pphLabel) {
      if (baseUnitInput.value === 'minutes') {
        pphLabel.textContent = 'Pages per minute';
      } else {
        pphLabel.textContent = 'Pages per hour';
      }
    }

    refreshUI();
  });


  // Export and Import
  exportBtn.addEventListener('click', () => {
    storage.exportData(state.getBooks());
    // Use a timeout for the alert so it doesn't block the download thread
    setTimeout(() => {
      alert('Data export initiated! Check your Downloads folder.');
    }, 500);
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

/* --- Keyboard Shortcuts --- */
document.addEventListener('keydown', (e) => {
  // Alt + A: Add a book
  if (e.altKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    document.getElementById('add-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('field-title').focus();
  }
  // Alt + S: Search
  if (e.altKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    document.getElementById('records').scrollIntoView({ behavior: 'smooth' });
    searchInput.focus();
  }
});


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
