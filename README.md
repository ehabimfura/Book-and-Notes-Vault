# Book & Notes Vault

A personal, framework-free app to track your books, pages, tags, and reading notes.

[**🌍 Live Site**](https://ehabimfura.github.io/Book-and-Notes-Vault/) | [**🎥 Watch Demo Video**](https://youtu.be/jwe4G3X1gKw)

## Features

### 1. Dashboard
- **Total Stats**: See your total books, total pages, and top tag at a glance.
- **Reading Goal**: Set a target for the number of books you want to read and see your progress bar grow.
- **Activity Trend**: A small bar chart shows how many books you have added over the last 7 days.
- **Unit Preference**: Choose between **Minutes** and **Hours** as your base unit to estimate reading time on the dashboard alongside Total Pages.

### 2. Records
- **Grid & Table**: View your collection in a responsive table (desktop) or as cards (mobile).
- **Book Covers**: Upload and view book cover images for your collection.
- **Quick Image Add**: If a book has no image, click the **+ Image** button to quickly add one.
- **Sorting**: Sort your records by Date Added, Title, or Page Count.

### 3. Smart Search
- **Top Search Bar**: Located at the top for easy access from any section.
- **Regex Support**: Use regular words or advanced Regex patterns to filter your books.
- **ISBN Detection**: Automatically finds ISBN-10 or ISBN-13 patterns in your notes.

### 4. Extra Tools
- **Web Scraper**: A dedicated page (`scraping.html`) that uses jQuery to find book details in HTML text and save them to your vault.
- **Import/Export**: Save your entire collection to a JSON file or import data from a previous export.

## Settings & Customization
- **Reading Speed**: Adjust your reading speed depending on your base unit (Pages per hour or Pages per minute) to get accurate time estimates.
- **Persistence**: Your data is saved in your browser's `localStorage`. No login required!

## Keyboard Shortcuts
- `Alt + A`: Go to Add Book form.
- `Alt + S`: Go to Search box.
- `Escape`: Close menus or reset views.

## How to Run
Just open `index.html` in any modern web browser. 

## Regex Features
- **ISBN Locator**: `/\b(?:ISBN(?:-1[03])?:?\s*)?(97[89]\d{10}|\d{9}[\dX])\b/i`
- **Typo Catching**: `/\b(\w+)\s+\1\b/` (catches repeated words like "the the")
- **Author Patterns**: `/\b(\w+)\b.*\b\1\b/` (finds repeated names)
