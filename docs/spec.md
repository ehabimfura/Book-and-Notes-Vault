# Book & Notes Vault — Specification

## 1. Overview

**Book & Notes Vault** is a single-page, vanilla HTML/CSS/JS web application that lets users catalogue books and reading notes. It supports adding, editing, deleting, sorting, searching (via regex), and persisting records. No frameworks (Bootstrap, React, etc.) are used.

The app demonstrates:
- Semantic HTML with responsive, mobile-first CSS
- DOM manipulation and event handling with modular JavaScript
- Regex-powered validation and search
- localStorage persistence and JSON import/export
- Keyboard navigation, ARIA live regions, and WCAG 2.1 AA compliance

---

## 2. Pages / Sections

All content lives in a single `index.html` with navigable sections:

| Section | Purpose |
|---|---|
| **About** | App purpose, student contact info (GitHub + email) |
| **Dashboard / Stats** | Total books, total pages, top tag, last-7-days trend chart |
| **Records Table** | Displays all book records (table on desktop, cards on mobile) |
| **Add / Edit Form** | Form to create or edit a record, with inline validation |
| **Settings** | Base unit preference (minutes ↔ hours / pages), currency (optional) |

Navigation uses a `<nav>` element with anchor links (`#dashboard`, `#records`, etc.).

---

## 3. Data Model

Each record represents a **book or note entry**:

```json
{
  "id": "book_0001",
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "pages": 1312,
  "tag": "Computer Science",
  "dateAdded": "2025-09-15",
  "createdAt": "2025-09-15T10:30:00.000Z",
  "updatedAt": "2025-09-15T10:30:00.000Z"
}
```

### Field Definitions

| Field | Type | Constraints |
|---|---|---|
| `id` | `string` | Auto-generated, unique (e.g. `book_XXXX` using `Date.now()` or counter) |
| `title` | `string` | Required; 1-200 chars; no leading/trailing spaces; no duplicate consecutive words |
| `author` | `string` | Required; letters, spaces, hyphens only |
| `pages` | `number` | Required; positive integer (≥1) |
| `tag` | `string` | Required; letters, spaces, hyphens only (e.g. "Fiction", "Computer Science") |
| `dateAdded` | `string` | Required; format `YYYY-MM-DD`; valid date |
| `createdAt` | `string` | ISO 8601; set automatically on creation |
| `updatedAt` | `string` | ISO 8601; updated automatically on edit |

---

## 4. Core Features

### A) Add Record
- Form fields: title, author, pages, tag, dateAdded
- Real-time inline validation (see §5)
- On success: record is added to state, table re-renders, localStorage is updated, form resets
- Status message via `role="status"` ARIA region

### B) Edit Record
- Click an "Edit" button on any row → form populates with that record's data
- On save: record updates in state + localStorage, `updatedAt` is refreshed

### C) Delete Record
- Click "Delete" → confirmation dialog
- On confirm: record removed from state, table re-renders, localStorage updated

### D) Sort
- Sort by: **dateAdded** (↑↓), **title** (A↕Z), **pages** (↑↓)
- Sort direction toggles on repeated clicks
- Current sort indicated visually and via `aria-sort`

### E) Regex Search
- Live search input: user types a regex pattern
- Compiled safely with `try/catch` → invalid patterns show friendly error
- Toggle for case-insensitive mode
- Matches highlighted using `<mark>` elements (accessible, no broken semantics)

### F) Stats Dashboard
- **Total records** count
- **Sum of pages** across all books
- **Top tag** (most frequent)
- **Last 7-day trend** — simple CSS/JS bar chart showing books added per day
- **Cap / Target**: user sets a numeric target (e.g. "Read 50 books this year"); remaining/overage shown via ARIA live message (polite when under, assertive when exceeded)

### G) Import / Export
- **Export**: download all records as a `.json` file
- **Import**: upload a `.json` file; validate structure before loading
- Graceful handling of malformed data (show error message)

### H) Settings
- **Units**: define base unit (pages); allow conversion (e.g. pages ↔ estimated hours based on user-specified pages-per-hour rate)
- Manual rate setting (no API calls)

---

## 5. Regex Validation Rules (Minimum 4 + 1 Advanced)

| # | Field | Rule | Regex Pattern | Purpose |
|---|---|---|---|---|
| 1 | `title` | No leading/trailing spaces, collapse doubles | `/^\S(?:.*\S)?$/` | Clean input |
| 2 | `pages` | Positive integer | `/^(0|[1-9]\d*)$/` | Numeric validation |
| 3 | `dateAdded` | Valid YYYY-MM-DD | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Date format |
| 4 | `tag` | Letters, spaces, hyphens | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Category validation |
| **5** ★ | `title` | **Detect duplicate consecutive words** (advanced back-reference) | `/\b(\w+)\s+\1\b/` | Prevents "the the" and similar typos |

Additional regex used in search:
- **ISBN extraction**: `/\b(?:ISBN(?:-1[03])?:?\s*)?(97[89]\d{10}\|\d{9}[\dX])\b/i`
- **Repeated author surnames** (back-reference): `/\b(\w+)\b.*\b\1\b/`

---

## 6. File Structure

```
Book-and-Notes-Vault/
├── index.html              # Single-page app entry
├── tests.html              # Small test assertions page
├── seed.json               # ≥10 diverse seed records
├── styles/
│   ├── main.css            # Base + layout styles
│   ├── components.css      # Buttons, cards, form, table
│   └── responsive.css      # Media queries (360px, 768px, 1024px)
├── scripts/
│   ├── app.js              # Main entry, initializes modules
│   ├── storage.js          # localStorage load/save, import/export
│   ├── state.js            # Central state management
│   ├── ui.js               # DOM rendering, table/card toggle
│   ├── validators.js       # All regex validations
│   └── search.js           # Regex compiler + highlight
├── assets/                 # Images, icons, etc.
├── docs/
│   ├── spec.md             # This file
│   ├── data-model.md       # Data model detail
│   ├── wireframes.md       # Wireframe descriptions + images
│   └── a11y-plan.md        # Accessibility plan
└── README.md               # Setup, features, regex catalog, keyboard map
```

---

## 7. Technology Constraints

- **No frameworks** (no Bootstrap, React, Tailwind, etc.)
- Optional jQuery only allowed on an extra scraping page (stretch)
- Vanilla HTML + CSS + JavaScript (ES modules or IIFE)
- Mobile-first responsive design (≥ 3 breakpoints: ~360px, 768px, 1024px)
- GitHub Pages deployment only (no Netlify, Heroku, Render)
