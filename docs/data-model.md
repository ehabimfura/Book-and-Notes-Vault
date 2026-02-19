# Book & Notes Vault — Data Model

## Record Schema

Each record represents a single **book or note** entry. All records are stored as an array in `localStorage` under the key `bookVaultData`.

### Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes (auto) | `"book_" + Date.now()` | Unique identifier, generated on creation |
| `title` | `string` | Yes | — | Book or note title (1–200 chars) |
| `author` | `string` | Yes | — | Author name (letters, spaces, hyphens) |
| `pages` | `number` | Yes | — | Number of pages (positive integer, ≥ 1) |
| `tag` | `string` | Yes | — | Category/tag (letters, spaces, hyphens) |
| `dateAdded` | `string` | Yes | — | When the book was added, format: `YYYY-MM-DD` |
| `createdAt` | `string` | Yes (auto) | `new Date().toISOString()` | ISO 8601 timestamp, set on creation |
| `updatedAt` | `string` | Yes (auto) | `new Date().toISOString()` | ISO 8601 timestamp, updated on every edit |

---

## Validation Rules

| Field | Regex / Rule | Error Message |
|---|---|---|
| `title` | `/^\S(?:.*\S)?$/` — no leading/trailing whitespace | "Title must not start or end with spaces." |
| `title` | `/\b(\w+)\s+\1\b/` — no duplicate consecutive words (advanced) | "Title contains duplicate words." |
| `title` | `length >= 1 && length <= 200` | "Title must be between 1 and 200 characters." |
| `author` | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | "Author must contain only letters, spaces, and hyphens." |
| `pages` | `/^[1-9]\d*$/` | "Pages must be a positive whole number." |
| `tag` | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | "Tag must contain only letters, spaces, and hyphens." |
| `dateAdded` | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | "Date must be in YYYY-MM-DD format." |

---

## ID Generation Strategy

```
"book_" + Date.now()
```

Example: `"book_1695820200000"`

This guarantees uniqueness since `Date.now()` returns milliseconds since epoch.  
For seed data, IDs use the format `"book_0001"`, `"book_0002"`, etc.

---

## localStorage Structure

**Key:** `bookVaultData`  
**Value:** JSON stringified array of record objects

```json
[
  {
    "id": "book_0001",
    "title": "Introduction to Algorithms",
    "author": "Thomas H Cormen",
    "pages": 1312,
    "tag": "Computer Science",
    "dateAdded": "2025-09-15",
    "createdAt": "2025-09-15T10:30:00.000Z",
    "updatedAt": "2025-09-15T10:30:00.000Z"
  }
]
```

**Settings Key:** `bookVaultSettings`  
**Value:** JSON object

```json
{
  "pagesPerHour": 30,
  "capTarget": 50,
  "sortField": "dateAdded",
  "sortDirection": "desc"
}
```

---

## Import / Export Format

### Export
- File download: `book-vault-export.json`
- Content: the full array of records as-is from localStorage

### Import
- Accept a `.json` file
- Validate before loading:
  1. File must parse as valid JSON
  2. Top-level value must be an array
  3. Each element must have all required fields with correct types
  4. On failure: show error with what went wrong, do **not** overwrite data

### Validation Check (on import)

```js
function isValidRecord(r) {
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.author === 'string' &&
    typeof r.pages === 'number' && r.pages > 0 &&
    typeof r.tag === 'string' &&
    typeof r.dateAdded === 'string' &&
    typeof r.createdAt === 'string' &&
    typeof r.updatedAt === 'string'
  );
}
```

---

## Example Records (Seed Data Preview)

See `seed.json` for full set (≥ 10 records with diverse data).

| id | title | author | pages | tag | dateAdded |
|---|---|---|---|---|---|
| book_0001 | Introduction to Algorithms | Thomas H Cormen | 1312 | Computer Science | 2025-09-15 |
| book_0002 | To Kill a Mockingbird | Harper Lee | 281 | Fiction | 2025-09-18 |
| book_0003 | A Brief History of Time | Stephen Hawking | 256 | Science | 2025-09-20 |
