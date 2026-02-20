/**
 * form-handler.js — Manages the Add/Edit book form
 *
 * Handles submit, validation feedback, field-level live validation,
 * edit mode toggling, and accessibility announcements.
 *
 * @module form-handler
 */

import { validateAll, validateTitle, validateAuthor, validatePages, validateTag, validateDate } from './validators.js';
import { addBook, updateBook } from './state.js';

/* --- HTML Elements --- */
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
    image: document.getElementById('field-image'),
};


const errorEls = {
    title: document.getElementById('field-title-error'),
    author: document.getElementById('field-author-error'),
    pages: document.getElementById('field-pages-error'),
    tag: document.getElementById('field-tag-error'),
    dateAdded: document.getElementById('field-date-error'),
};

/* --- Checks for the fields --- */
const fieldValidators = {
    title: validateTitle,
    author: validateAuthor,
    pages: validatePages,
    tag: validateTag,
    dateAdded: validateDate,
};

/* --- Event name for when a book is saved --- */
const BOOK_SAVED_EVENT = 'book-saved';

/* --- Helper functions --- */

/** Show or hide an error message for a field */
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

/** Hide all error messages */
function clearAllErrors() {
    for (const name of Object.keys(fields)) {
        setFieldError(name, '');
    }
}

/** Post a message for screen readers */
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
        coverImageFile: fields.image.files[0]
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
    // Clear preview if any (will add preview logic later if needed)
}


/* ========== Core: Submit Handler ========== */

function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    const data = readFormData();
    const { valid, errors } = validateAll(data);

    if (!valid) {
        // Show errors
        for (const [field, msg] of Object.entries(errors)) {
            setFieldError(field, msg);
        }
        // Focus the first error
        const firstInvalid = Object.keys(errors)[0];
        if (firstInvalid && fields[firstInvalid]) {
            fields[firstInvalid].focus();
        }
        announce('The form has errors. Please fix them.');
        return;
    }

    const now = new Date().toISOString();
    const editId = editIdInput.value;

    /** Internal function to finalize saving */
    const finalizeSave = (imageData) => {
        if (editId) {
            updateBook(editId, {
                title: data.title,
                author: data.author,
                pages: parseInt(data.pages, 10),
                tag: data.tag,
                dateAdded: data.dateAdded,
                updatedAt: now,
                ...(imageData ? { cover_image: imageData } : {})
            });
            announce(`"${data.title}" was updated.`);
        } else {
            const id = 'book_' + Date.now();
            addBook({
                id: id,
                title: data.title,
                author: data.author,
                pages: parseInt(data.pages, 10),
                tag: data.tag,
                dateAdded: data.dateAdded,
                createdAt: now,
                updatedAt: now,
                cover_image: imageData || null
            });
            announce(`"${data.title}" was added.`);
        }


        resetForm();
        document.dispatchEvent(new CustomEvent(BOOK_SAVED_EVENT));
    };

    // If an image was picked, read it first
    if (data.coverImageFile) {
        const reader = new FileReader();
        reader.onload = (e) => finalizeSave(e.target.result);
        reader.onerror = () => finalizeSave(null);
        reader.readAsDataURL(data.coverImageFile);
    } else {
        finalizeSave(null);
    }
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
