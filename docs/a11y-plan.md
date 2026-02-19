# Book & Notes Vault — Accessibility (a11y) Plan

## 1. Target Standard

**WCAG 2.1 Level AA** compliance across all pages and interactions.

---

## 2. Semantic HTML Structure

### Landmark Elements

```
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header>        → App title, logo
    <nav>         → Section links (About, Dashboard, Records, Add, Settings)
  </header>
  <main id="main-content">
    <section id="about">        → About section
    <section id="dashboard">    → Stats dashboard
    <section id="records">      → Records table/cards
    <section id="add-form">     → Add/Edit form
    <section id="settings">     → Settings panel
  </main>
  <footer>        → Copyright, contact links
</body>
```

### Heading Hierarchy

| Level | Usage |
|---|---|
| `<h1>` | App title (exactly one per page) |
| `<h2>` | Section titles: About, Dashboard, Records, Add Book, Settings |
| `<h3>` | Sub-sections (e.g., "7-Day Trend", "Top Tag") |

---

## 3. Skip Link

A visually hidden **"Skip to content"** link is the first focusable element in the DOM:

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #ffffff;
  z-index: 10000;
  font-size: 1rem;
}
```

---

## 4. Form Accessibility

### Labels
- Every `<input>`, `<select>`, and `<textarea>` has a matching `<label>` with `for` attribute
- Placeholder text **is not** used as a label substitute

### Error Messages
- Each field has a corresponding `<span class="error-msg" id="[field]-error" aria-live="polite"></span>`
- When validation fails, error text is injected and `aria-describedby` links the input to its error
- Error spans use `role="alert"` for critical errors or `aria-live="polite"` for inline validation

### Required Fields
- Inputs marked with `aria-required="true"` and `required` attribute

### Example Form Input Pattern

```html
<div class="form-group">
  <label for="title">Title <span aria-hidden="true">*</span></label>
  <input 
    type="text" 
    id="title" 
    name="title" 
    required 
    aria-required="true"
    aria-describedby="title-error"
    autocomplete="off"
  />
  <span id="title-error" class="error-msg" role="alert"></span>
</div>
```

---

## 5. ARIA Live Regions

| Region | Location | `aria-live` | Purpose |
|---|---|---|---|
| Status messages | Below form | `polite` | "Record added successfully", "Record updated" |
| Cap/target status | Dashboard | `polite` / `assertive` | "15 books remaining" (polite) or "Target exceeded!" (assertive) |
| Search feedback | Search area | `polite` | "3 matches found" or "Invalid regex pattern" |
| Delete confirmation | Modal | `assertive` | "Record deleted" |

---

## 6. Keyboard Navigation

### Tab Order
Natural top-to-bottom, left-to-right tab flow:
1. Skip link
2. Nav links (About → Dashboard → Records → Add → Settings)
3. Search input + case toggle
4. Sort buttons
5. Table rows → Edit / Delete buttons per row
6. Form inputs → Submit button
7. Settings inputs
8. Import / Export buttons
9. Footer links

### Keyboard Shortcuts Map

| Key | Action | Context |
|---|---|---|
| `Tab` / `Shift+Tab` | Move forward / backward through focusable elements | Global |
| `Enter` / `Space` | Activate buttons, links, toggles | Global |
| `Escape` | Close modal / cancel edit | When modal or edit mode is active |
| `Arrow ↑ / ↓` | Navigate between table rows (optional enhancement) | Records table |

### Focus Management
- After adding a record: focus moves to the new record in the table (or to a success message)
- After deleting a record: focus moves to the previous row or to a status message
- After opening a confirmation dialog: focus moves to the "Confirm" button
- After closing a modal: focus returns to the element that triggered it

---

## 7. Color & Contrast

### Requirements
- **Text**: minimum 4.5:1 contrast ratio against background (WCAG AA normal text)
- **Large text** (≥ 18pt / 14pt bold): minimum 3:1
- **UI components** (buttons, inputs, icons): minimum 3:1 against adjacent colors

### Planned Color Palette

| Role | Color | Against Background | Ratio |
|---|---|---|---|
| Primary text | `#1a1a2e` (dark navy) | `#ffffff` | ≥ 12:1 ✓ |
| Primary accent | `#e94560` (crimson) | `#ffffff` | ≥ 4.6:1 ✓ |
| Secondary accent | `#0f3460` (deep blue) | `#ffffff` | ≥ 8:1 ✓ |
| Success | `#2d6a4f` (forest green) | `#ffffff` | ≥ 5.5:1 ✓ |
| Error | `#d00000` (red) | `#ffffff` | ≥ 5.2:1 ✓ |
| Background | `#ffffff` | — | — |
| Card/Surface | `#f8f9fa` (light gray) | `#1a1a2e` text | ≥ 11:1 ✓ |

### Focus Indicators
- Visible, high-contrast focus outline on all interactive elements:

```css
:focus-visible {
  outline: 3px solid #e94560;
  outline-offset: 2px;
}
```

- **Never** use `outline: none` without a replacement focus style

---

## 8. Responsive Design & Touch Targets

### Breakpoints (Mobile-First)

| Breakpoint | Layout |
|---|---|
| Default (≤ 360px) | Single column; records as cards; stacked form; hamburger nav |
| ≥ 768px (Tablet) | Two-column where useful; table view for records; side nav |
| ≥ 1024px (Desktop) | Full table view; dashboard side-by-side with records; expanded nav |

### Touch Targets
- Minimum **44px × 44px** for all interactive elements (buttons, links, inputs)
- Adequate spacing between tap targets (≥ 8px gap)

---

## 9. `<mark>` for Search Highlighting

When regex search matches text, the matching portions are wrapped in `<mark>`:

```html
<td>Introduction to <mark>Algorithm</mark>s</td>
```

- `<mark>` is semantically correct for highlighting search results
- Screen readers announce marked text; no additional ARIA needed
- Custom styles ensure sufficient contrast:

```css
mark {
  background-color: #fff3cd;
  color: #1a1a2e;
  padding: 0 2px;
  border-radius: 2px;
}
```

---

## 10. Testing & Verification Plan

| Tool / Method | What It Checks |
|---|---|
| **Keyboard-only testing** | Tab through entire app without mouse; verify all features accessible |
| **Screen reader testing** (VoiceOver on macOS) | Landmarks, headings, labels, live regions announced correctly |
| **Browser DevTools** (Lighthouse audit) | Automated a11y score |
| **Manual contrast check** | Use WebAIM Contrast Checker for all text/background pairs |
| **Reduced motion** | Test with `prefers-reduced-motion: reduce` — animations should be minimal/disabled |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
