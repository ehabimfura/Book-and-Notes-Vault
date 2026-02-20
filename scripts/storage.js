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
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Failed to load books from localStorage:', err);
        return [];
    }
}

/** Save settings to the browser */
export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Load settings from the browser */
export function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Failed to load settings from localStorage:', err);
        return null;
    }
}


/** Turn books into a JSON file for the user to download */
export function exportData(books) {
    const dataStr = JSON.stringify(books, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'book-vault-export.json';

    document.body.appendChild(a);

    // Use a small delay for execution stability in Chrome
    setTimeout(() => {
        a.click();

        // Revoke after a very long delay (1 minute) to ensure Chrome background
        // processes have completed the file write to the OS.
        setTimeout(() => {
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
        }, 60000);
    }, 100);
}

/** Try to read books from a file the user uploads */
export async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    // Basic validation: ensure each book has an ID and a Title
                    const validBooks = data.filter(book => book && book.id && book.title);
                    if (validBooks.length === 0 && data.length > 0) {
                        reject(new Error('The file does not contain valid book records.'));
                    } else {
                        resolve(validBooks);
                    }
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

