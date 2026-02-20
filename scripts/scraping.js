/**
 * scraping.js
 * This file uses jQuery to find books in HTML.
 */

$(document).ready(function () {
    const $source = $('#html-source');
    const $results = $('#scraping-results');

    $('#btn-scrape').on('click', function () {
        const html = $source.val();
        if (!html) return;

        // Make a fake element to search inside
        const $parsed = $('<div>').html(html);
        $results.empty();

        // Look for books (h3 for title, .author for author)
        $parsed.find('h3').each(function () {
            const title = $(this).text().trim();
            const author = $(this).next('.author').text().trim() || "Unknown Author";

            if (title) {
                renderScrapedItem(title, author);
            }
        });

        if ($results.children().length === 0) {
            $results.append('<p>No books found. Try something like:<br><code>&lt;h3&gt;Title&lt;/h3&gt;&lt;p class="author"&gt;Author Name&lt;/p&gt;</code></p>');
        }
    });

    function renderScrapedItem(title, author) {
        const $item = $(`
            <div class="scraped-item">
                <div class="scraped-info">
                    <h4>${title}</h4>
                    <p>Author: ${author}</p>
                </div>
                <button class="btn btn--small btn--save">Save to Vault</button>
            </div>
        `);

        $item.find('.btn--save').on('click', function () {
            saveToVault(title, author);
            $(this).text('Saved!').attr('disabled', true);
        });

        $results.append($item);
    }

    function saveToVault(title, author) {
        // Load existing books
        const data = localStorage.getItem('bookVaultData');
        const books = data ? JSON.parse(data) : [];

        // Make new book
        const newBook = {
            id: 'book_' + Date.now() + Math.floor(Math.random() * 1000),
            title: title,
            author: author,
            pages: 100, // Default pages
            tag: "Scraped",
            dateAdded: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cover_image: null
        };


        books.push(newBook);
        localStorage.setItem('bookVaultData', JSON.stringify(books));
    }
});
