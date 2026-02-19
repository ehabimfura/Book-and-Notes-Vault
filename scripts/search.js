/**
 * search.js
 * This file helps search through books using regex.
 */

/** Check if a book matches the search word or regex */
export function matchesSearch(book, query, isCaseSensitive) {
    if (!query) return true;

    try {
        const regex = new RegExp(query, isCaseSensitive ? '' : 'i');
        return (
            regex.test(book.title) ||
            regex.test(book.author) ||
            regex.test(book.tag)
        );
    } catch (e) {
        // If regex is bad, just check if the text is inside
        const q = isCaseSensitive ? query : query.toLowerCase();
        const t = isCaseSensitive ? book.title : book.title.toLowerCase();
        const a = isCaseSensitive ? book.author : book.author.toLowerCase();
        const g = isCaseSensitive ? book.tag : book.tag.toLowerCase();
        return t.includes(q) || a.includes(q) || g.includes(q);
    }
}

/** Highlight text that matches the search */
export function highlightText(text, query, isCaseSensitive) {
    if (!query) return text;

    try {
        const regex = new RegExp(`(${query})`, isCaseSensitive ? 'g' : 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    } catch (e) {
        return text;
    }
}
