/**
 * state.js
 * This file keeps track of all the books and settings.
 */

// Default settings
const DEFAULT_SETTINGS = {
    pagesPerHour: 30,
    target: 50,
    sortField: 'dateAdded',
    sortDirection: 'desc'
};

// Current data in memory
let state = {
    books: [],
    settings: { ...DEFAULT_SETTINGS },
    searchQuery: '',
    isCaseSensitive: false
};

/** Get the list of books */
export function getBooks() {
    return state.books;
}

/** Set the list of books */
export function setBooks(books) {
    state.books = Array.isArray(books) ? books : [];
}

/** Get settings */
export function getSettings() {
    return state.settings;
}

/** Update settings */
export function updateSettings(newSettings) {
    state.settings = { ...state.settings, ...newSettings };
}

/** Get search data */
export function getSearchState() {
    return {
        query: state.searchQuery,
        isCaseSensitive: state.isCaseSensitive
    };
}

/** Update search data */
export function updateSearch(query, isCaseSensitive) {
    state.searchQuery = query;
    state.isCaseSensitive = isCaseSensitive;
}

/** Add a new book */
export function addBook(book) {
    state.books.push(book);
}

/** Update an existing book */
export function updateBook(id, updatedData) {
    const index = state.books.findIndex(b => b.id === id);
    if (index !== -1) {
        state.books[index] = { ...state.books[index], ...updatedData };
        return true;
    }
    return false;
}

/** Remove a book */
export function deleteBook(id) {
    state.books = state.books.filter(b => b.id !== id);
}
