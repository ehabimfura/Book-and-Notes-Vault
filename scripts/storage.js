/**
 * storage.js
 * This file saves and loads data from the browser.
 */

const STORAGE_KEY = 'bookVaultData';
const SETTINGS_KEY = 'bookVaultSettings';

/** Save books to the browser */
export function saveBooks(books) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

/** Load books from the browser */
export function loadBooks() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/** Save settings to the browser */
export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Load settings from the browser */
export function loadSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
}

/** Turn books into a JSON file for the user to download */
export function exportData(books) {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book-vault-export.json';
    a.click();
    URL.revokeObjectURL(url);
}

/** Try to read books from a file the user uploads */
export async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    resolve(data);
                } else {
                    reject(new Error('File must be a list of books.'));
                }
            } catch (err) {
                reject(new Error('This is not a valid JSON file.'));
            }
        };
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsText(file);
    });
}
