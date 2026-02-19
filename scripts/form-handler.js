/**
 * form-handler.js — Manages the Add/Edit book form
 *
 * Handles submit, validation feedback, field-level live validation,
 * edit mode toggling, and accessibility announcements.
 *
 * @module form-handler
 */

import { validateAll, validateTitle, validateAuthor, validatePages, validateTag, validateDate } from './validators.js';

/* ========== DOM References ========== */
const form = document.getElementById('book-form');
const editIdInput = document.getElementById('edit-id');
const formHeading = document.getElementById('form-heading');
const submitBtn = document.getElementById('form-submit');
const cancelBtn = document.getElementById('form-cancel');
const statusMsg = document.getElementById('status-message');

const fields = {
    title: document.getElementById('field-title'),
    author: document.getElementById('field-author'),
    pages: document.getElementById('field-pages'),
    tag: document.getElementById('field-tag'),
    dateAdded: document.getElementById('field-date'),
};

const errorEls = {
    title: document.getElementById('field-title-error'),
    author: document.getElementById('field-author-error'),
    pages: document.getElementById('field-pages-error'),
    tag: document.getElementById('field-tag-error'),
    dateAdded: document.getElementById('field-date-error'),
};

/* Field→validator map for live validation */
const fieldValidators = {
    title: validateTitle,
    author: validateAuthor,
    pages: validatePages,
    tag: validateTag,
    dateAdded: validateDate,
};

/* ========== Custom Event: book-saved ========== */
// Other modules listen for this event to refresh renders, stats, persistence
const BOOK_SAVED_EVENT = 'book-saved';

/* ========== Helpers ========== */

/**
 * Show/clear a single field error.
 * @param {string} fieldName
 * @param {string} message  — empty string to clear
 */
function setFieldError(fieldName, message) {
    const input = fields[fieldName];
    const errorEl = errorEls[fieldName];
    if (!input || !errorEl) return;

    if (message) {
        input.classList.add('invalid');
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
    } else {
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
        errorEl.textContent = '';
    }
}

/** Clear all field errors. */
function clearAllErrors() {
    for (const name of Object.keys(fields)) {
        setFieldError(name, '');
    }
}

/** Announce a status message to screen readers. */
function announce(text) {
    if (statusMsg) {
        statusMsg.textContent = text;
    }
}

/** Read all form field values. */
function readFormData() {
    return {
        title: fields.title.value,
        author: fields.author.value,
        pages: fields.pages.value,
        tag: fields.tag.value,
        dateAdded: fields.dateAdded.value,
    };
}

/** Reset the form to "Add" mode. */
function resetForm() {
    form.reset();
    editIdInput.value = '';
    formHeading.textContent = 'Add Book';
    submitBtn.textContent = 'Add Book';
    cancelBtn.hidden = true;
    clearAllErrors();
}

/* ========== In-memory store reference ========== */
// We keep a module-level reference so getBooks/setBooks can be
// injected from the main app. Default to a simple array.
let _books = [];

/** Replace the module-level book list. Called by app.js on init. */
export function setBooks(books) {
    _books = books;
}

/** Get current book list. */
export function getBooks() {
    return _books;
}

/* ========== Core: Submit Handler ========== */

function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    const data = readFormData();
    const { valid, errors } = validateAll(data);

    if (!valid) {
        // Show per-field error messages
        for (const [field, msg] of Object.entries(errors)) {
            setFieldError(field, msg);
        }
        // Focus the first invalid field
        const firstInvalid = Object.keys(errors)[0];
        if (firstInvalid && fields[firstInvalid]) {
            fields[firstInvalid].focus();
        }
        announce('Form contains errors. Please correct them and try again.');
        return;
    }

    const now = new Date().toISOString();
    const editId = editIdInput.value;

    if (editId) {
        // ——— Edit mode ———
        const idx = _books.findIndex((b) => b.id === editId);
        if (idx !== -1) {
            _books[idx] = {
                ..._books[idx],
                title: data.title,
                author: data.author,
                pages: parseInt(data.pages, 10),
                tag: data.tag,
                dateAdded: data.dateAdded,
                updatedAt: now,
            };
            announce(`"${data.title}" has been updated.`);
        }
    } else {
        // ——— Add mode ———
        const newBook = {
            id: 'book_' + Date.now(),
            title: data.title,
            author: data.author,
            pages: parseInt(data.pages, 10),
            tag: data.tag,
            dateAdded: data.dateAdded,
            createdAt: now,
            updatedAt: now,
        };
        _books.push(newBook);
        announce(`"${data.title}" has been added.`);
    }

    resetForm();

    // Dispatch custom event so other modules update
    document.dispatchEvent(new CustomEvent(BOOK_SAVED_EVENT, { detail: { books: _books } }));
}

/* ========== Edit Mode ========== */

/**
 * Populate the form with a book's data for editing.
 * @param {object} book — a book record
 */
export function loadForEdit(book) {
    if (!book) return;

    editIdInput.value = book.id;
    fields.title.value = book.title;
    fields.author.value = book.author;
    fields.pages.value = book.pages;
    fields.tag.value = book.tag;
    fields.dateAdded.value = book.dateAdded;

    formHeading.textContent = 'Edit Book';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.hidden = false;

    clearAllErrors();
    fields.title.focus();
    announce(`Editing "${book.title}".`);
}

/* ========== Live (per-keystroke) Validation ========== */

function attachLiveValidation() {
    for (const [name, input] of Object.entries(fields)) {
        const validator = fieldValidators[name];
        if (!validator) continue;

        input.addEventListener('input', () => {
            const { valid, message } = validator(input.value);
            // Only show error if the user has typed something (don't nag on empty during entry)
            if (input.value.length > 0 && !valid) {
                setFieldError(name, message);
            } else {
                setFieldError(name, '');
            }
        });

        // Also validate on blur (catches empty required fields when user tabs away)
        input.addEventListener('blur', () => {
            const { valid, message } = validator(input.value);
            if (!valid) {
                setFieldError(name, message);
            }
        });
    }
}

/* ========== Init ========== */

export function initFormHandler() {
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            resetForm();
            announce('Edit cancelled.');
        });
    }

    attachLiveValidation();

    // Set today's date as default for the date field
    const today = new Date().toISOString().split('T')[0];
    if (fields.dateAdded && !fields.dateAdded.value) {
        fields.dateAdded.value = today;
    }
}
