/**
 * validators.js — Regex-based field validation for Book & Notes Vault
 *
 * Each validator returns { valid: boolean, message: string }.
 * Uses 5 regex rules (4 standard + 1 advanced back-reference).
 *
 * @module validators
 */

/* ========== Regex Patterns ========== */

/** Rule 1  — Title: no leading/trailing whitespace */
const RE_TITLE_TRIM = /^\S(.*\S)?$/;

/** Rule 2  — Title: no consecutive duplicate words (advanced back-reference) */
const RE_TITLE_DUPE = /\b(\w+)\s+\1\b/i;

/** Rule 3  — Author/Tag: letters, spaces, and hyphens only */
const RE_NAME = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

/** Rule 4  — Pages: positive integer (no leading zeros) */
const RE_PAGES = /^[1-9]\d*$/;

/** Rule 5  — Date: YYYY-MM-DD with valid ranges */
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/* ========== Validators ========== */

/**
 * Validate the "title" field.
 * @param {string} value - Raw input value.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateTitle(value) {
    const v = value ?? '';

    if (v.length === 0) {
        return { valid: false, message: 'Title is required.' };
    }

    if (v.length > 200) {
        return { valid: false, message: 'Title must be 200 characters or fewer.' };
    }

    // Regex Rule 1 — no leading/trailing whitespace
    if (!RE_TITLE_TRIM.test(v)) {
        return { valid: false, message: 'Title must not start or end with spaces.' };
    }

    // Regex Rule 2 — advanced back-reference: no duplicate consecutive words
    if (RE_TITLE_DUPE.test(v)) {
        return { valid: false, message: 'Title contains duplicate consecutive words.' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate the "author" field.
 * @param {string} value - Raw input value.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateAuthor(value) {
    const v = (value ?? '').trim();

    if (v.length === 0) {
        return { valid: false, message: 'Author is required.' };
    }

    // Regex Rule 3 — letters, spaces, hyphens
    if (!RE_NAME.test(v)) {
        return { valid: false, message: 'Author must contain only letters, spaces, and hyphens.' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate the "pages" field.
 * @param {string|number} value - Raw input value (could be string from input).
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePages(value) {
    const v = String(value ?? '').trim();

    if (v.length === 0) {
        return { valid: false, message: 'Pages is required.' };
    }

    // Regex Rule 4 — positive integer
    if (!RE_PAGES.test(v)) {
        return { valid: false, message: 'Pages must be a positive whole number.' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate the "tag" field.
 * @param {string} value - Raw input value.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateTag(value) {
    const v = (value ?? '').trim();

    if (v.length === 0) {
        return { valid: false, message: 'Tag is required.' };
    }

    // Regex Rule 3 (same pattern) — letters, spaces, hyphens
    if (!RE_NAME.test(v)) {
        return { valid: false, message: 'Tag must contain only letters, spaces, and hyphens.' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate the "dateAdded" field.
 * @param {string} value - Raw input value.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateDate(value) {
    const v = (value ?? '').trim();

    if (v.length === 0) {
        return { valid: false, message: 'Date is required.' };
    }

    // Regex Rule 5 — YYYY-MM-DD
    if (!RE_DATE.test(v)) {
        return { valid: false, message: 'Date must be in YYYY-MM-DD format.' };
    }

    return { valid: true, message: '' };
}

/**
 * Validate all fields at once.
 * @param {{ title: string, author: string, pages: string|number, tag: string, dateAdded: string }} data
 * @returns {{ valid: boolean, errors: Object.<string, string> }}
 */
export function validateAll(data) {
    const results = {
        title: validateTitle(data.title),
        author: validateAuthor(data.author),
        pages: validatePages(data.pages),
        tag: validateTag(data.tag),
        dateAdded: validateDate(data.dateAdded),
    };

    const errors = {};
    let valid = true;

    for (const [field, result] of Object.entries(results)) {
        if (!result.valid) {
            valid = false;
            errors[field] = result.message;
        }
    }

    return { valid, errors };
}

/* ========== Exported Regex Patterns (for tests) ========== */
export const PATTERNS = {
    RE_TITLE_TRIM,
    RE_TITLE_DUPE,
    RE_NAME,
    RE_PAGES,
    RE_DATE,
};
