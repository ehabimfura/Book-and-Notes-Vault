/**
 * ui.js
 * This file draws everything on the screen.
 */

import { highlightText } from './search.js';

// DOM elements
const tbody = document.getElementById('records-tbody');
const cardsContainer = document.getElementById('records-cards');
const emptyState = document.getElementById('empty-state');
const totalBooksEl = document.getElementById('stat-total-books');
const totalPagesEl = document.getElementById('stat-total-pages');
const topTagEl = document.getElementById('stat-top-tag');
const targetProgressEl = document.getElementById('stat-target-progress');
const progressFill = document.getElementById('target-progress-fill');
const trendChart = document.getElementById('trend-chart');

/** Draw the list of books in the table and as cards */
export function renderRecords(books, query, isCaseSensitive, onEdit, onDelete) {
    tbody.innerHTML = '';
    cardsContainer.innerHTML = '';

    if (books.length === 0) {
        emptyState.hidden = false;
        return;
    }
    emptyState.hidden = true;

    books.forEach(book => {
        // Table Row
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${highlightText(book.title, query, isCaseSensitive)}</td>
      <td>${highlightText(book.author, query, isCaseSensitive)}</td>
      <td>${book.pages}</td>
      <td>${highlightText(book.tag, query, isCaseSensitive)}</td>
      <td>${book.dateAdded}</td>
      <td>
        <button class="btn btn--small btn--edit" data-id="${book.id}">Edit</button>
        <button class="btn btn--small btn--danger" data-id="${book.id}">Delete</button>
      </td>
    `;

        tr.querySelector('.btn--edit').onclick = () => onEdit(book);
        tr.querySelector('.btn--danger').onclick = () => onDelete(book.id);
        tbody.appendChild(tr);

        // Card (for mobile)
        const card = document.createElement('div');
        card.className = 'record-card';
        card.innerHTML = `
      <h3>${highlightText(book.title, query, isCaseSensitive)}</h3>
      <p><strong>Author:</strong> ${highlightText(book.author, query, isCaseSensitive)}</p>
      <p><strong>Pages:</strong> ${book.pages}</p>
      <p><strong>Tag:</strong> ${highlightText(book.tag, query, isCaseSensitive)}</p>
      <p><strong>Date:</strong> ${book.dateAdded}</p>
      <div class="card-actions">
        <button class="btn btn--small btn--edit" data-id="${book.id}">Edit</button>
        <button class="btn btn--small btn--danger" data-id="${book.id}">Delete</button>
      </div>
    `;
        card.querySelector('.btn--edit').onclick = () => onEdit(book);
        card.querySelector('.btn--danger').onclick = () => onDelete(book.id);
        cardsContainer.appendChild(card);
    });
}

/** Update the numbers and chart on the dashboard */
export function renderStats(books, settings) {
    const totalBooks = books.length;
    const totalPages = books.reduce((sum, b) => sum + b.pages, 0);

    // Find top tag
    const tags = {};
    books.forEach(b => tags[b.tag] = (tags[b.tag] || 0) + 1);
    const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    totalBooksEl.textContent = totalBooks;
    totalPagesEl.textContent = totalPages;
    topTagEl.textContent = topTag;

    // Progress bar
    const target = settings.target || 0;
    targetProgressEl.textContent = `${totalBooks} / ${target}`;
    const percent = target > 0 ? Math.min((totalBooks / target) * 100, 100) : 0;
    progressFill.style.width = `${percent}%`;

    renderTrendChart(books);
}

/** Draw a small bar chart for the last 7 days */
function renderTrendChart(books) {
    trendChart.innerHTML = '';
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = books.filter(b => b.dateAdded === dateStr).length;

        const bar = document.createElement('div');
        bar.className = 'trend-bar'; // Fix: Use 'trend-bar' class name
        const height = count * 20; // Each book is 20 pixels high
        bar.style.height = `${Math.max(height, 5)}px`;
        bar.title = `${dateStr}: ${count} books`;
        trendChart.appendChild(bar);
    }
}
