# Book & Notes Vault

A simple app to track your books and notes. No frameworks used.

## Features
- **Dashboard**: See your total books, pages, and top tags.
- **Records**: Add, edit, and delete books.
- **Search**: Use regular words or special regex patterns.
- **Persistence**: Your data stays saved in your browser.
- **Import/Export**: Save your data to a file.

## Keyboard Shortcuts
- `Alt + A`: Go to Add Book form.
- `Alt + S`: Go to Search box.
- `Escape`: Close menus or popups.

## Web Scraper (Milestone 6)
Go to `scraping.html` to find books from HTML text.
1. Paste HTML into the box.
2. Click "Find Books".
3. Click "Save to Vault" to add a book to your main collection.

## How to Run
Just open `index.html` in any web browser.

## Regex Used
- **ISBN**: `/\b(?:ISBN(?:-1[03])?:?\s*)?(97[89]\d{10}|\d{9}[\dX])\b/i`
- **Duplicate Words**: `/\b(\w+)\s+\1\b/` (Prevents "the the" typos)
- **Repeated Authors**: `/\b(\w+)\b.*\b\1\b/`
