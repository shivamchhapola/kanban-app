# Frontend Design System

## Design Tokens (CSS Custom Properties)

All visual constants are defined as CSS custom properties on `:root` (light mode) and `[data-theme="dark"]`. Components reference tokens — never raw values.

```css
/* client/src/styles/tokens.css */

:root {
  /* Brand */
  --color-primary:          #635FC7;
  --color-primary-hover:    #A8A4FF;

  /* Surfaces */
  --color-bg:               #F4F7FD;
  --color-surface:          #FFFFFF;
  --color-sidebar:          #FFFFFF;

  /* Text */
  --color-text-primary:     #000112;
  --color-text-secondary:   #828FA3;
  --color-text-on-primary:  #FFFFFF;

  /* Borders & Lines */
  --color-border:           #E4EBFA;
  --color-line:             #E4EBFA;

  /* Status colors (column dots) */
  --color-todo:             #49C4E5;
  --color-doing:            #8471F2;
  --color-done:             #67E2AE;

  /* Danger */
  --color-danger:           #EA5555;
  --color-danger-hover:     #FF9898;

  /* Spacing scale */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   32px;
  --space-2xl:  48px;

  /* Border radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;
  --radius-pill: 24px;

  /* Typography */
  --font-family: 'Plus Jakarta Sans', sans-serif;
  --font-size-xs:   11px;
  --font-size-sm:   12px;
  --font-size-md:   15px;
  --font-size-lg:   18px;
  --font-size-xl:   24px;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shadows */
  --shadow-card: 0px 4px 6px rgba(54, 78, 126, 0.102);
  --shadow-modal: 0 10px 40px rgba(0, 0, 0, 0.25);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}

[data-theme="dark"] {
  --color-bg:       #20212C;
  --color-surface:  #2B2C37;
  --color-sidebar:  #2B2C37;
  --color-text-primary:   #FFFFFF;
  --color-text-secondary: #828FA3;
  --color-border:   #3E3F4E;
  --color-line:     #3E3F4E;
}
```

---

## Typography

Font: **Plus Jakarta Sans** (Google Fonts)

| Name | Size | Weight | Usage |
|---|---|---|---|
| Heading XL | 24px | Bold | Board title in header |
| Heading L | 18px | Bold | Modal titles |
| Heading M | 15px | Bold | Task card titles |
| Heading S | 12px | Bold | Column headers (uppercase + letter-spacing) |
| Body L | 15px | Medium | Body text, descriptions |
| Body M | 13px | Medium | Subtask text, labels |

---

## Layout

### App Shell

```
┌─────────────────────────────────────────────────────────┐
│  Header (fixed top, full width)                          │
│  ┌───────────┐  ┌──────────────────────────────────────┐│
│  │  Sidebar  │  │  Board Canvas                         ││
│  │  (fixed)  │  │  (scrollable, overflow-x: auto)       ││
│  │           │  │                                        ││
│  │           │  │  [Column] [Column] [Column] [+New Col] ││
│  │           │  │                                        ││
│  └───────────┘  └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

- Sidebar: `260px` fixed width, `100vh` height
- Header: `72px` tall, sits above the board canvas (not above sidebar)
- Board canvas: fills remaining space, `overflow-x: auto` for horizontal column scroll
- Column: `280px` min-width, fixed, doesn't shrink

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 768px` | Full layout: sidebar always visible |
| `≤ 768px` | Sidebar hidden; hamburger menu in header opens it as an overlay |

---

## Component Inventory

### Sidebar
- Board list with active state highlight (purple background)
- "+ Create New Board" button
- Theme toggle switch (sun / moon icons)

### Header
- Board name (Heading XL)
- "+ Add New Task" button (primary, disabled when no board selected)
- Three-dot menu (edit board, delete board)

### Board Canvas
- Renders columns horizontally
- "+ New Column" ghost column at the end
- `overflow-x: auto` with snap behavior

### Column
- Colored dot + column name + task count (`HEADING S` uppercase)
- List of TaskCards
- No explicit "add task" button per column (only in header)

### TaskCard
- White (dark: dark surface) rounded card
- Task title (Heading M)
- Subtask progress text ("X of Y subtasks")
- Hover: slight lift (box-shadow increase + cursor pointer)
- Click: opens TaskModal

### TaskModal
- Overlay with backdrop blur
- Task title (editable inline or via edit mode)
- Description
- Subtask checklist with toggle
- "Status" dropdown to move task between columns
- Edit / Delete actions via three-dot menu

### CreateTaskModal / EditTaskModal
- Form with: Title (required), Description, dynamic Subtask inputs, Status (column) select
- Inline field-level error messages
- Cancel / Submit buttons

### ConfirmDeleteModal
- Destructive action confirmation
- Red "Delete" button, grey "Cancel" button

### Button variants
- **Primary** — purple background, white text
- **Secondary** — light purple background (light mode) / dark surface (dark mode)
- **Destructive** — red background
- **Ghost** — no background, used for "+ New Column" and "+ Add Subtask"

---

## Hover & Interaction States

| Element | Default | Hover | Active |
|---|---|---|---|
| Sidebar board item | Transparent bg | Purple-tinted bg, text to purple | Purple bg, white text |
| Primary button | `--color-primary` | `--color-primary-hover` | Slight scale down |
| Task card | Default shadow | Elevated shadow | — |
| Column header | — | — | — |
| Subtask checkbox | Empty | Border color change | Filled purple |
| Theme toggle | — | Opacity change | Toggles |

---

## Modal Behavior

- Opening: `opacity 0 → 1` + `translateY(8px) → 0`, `200ms ease`
- Closing: reverse
- Backdrop: semi-transparent dark overlay, clicking it closes the modal
- Focus trap: Tab key cycles only within the open modal
- Escape key: closes the modal

---

## File Structure

```
client/src/
├── styles/
│   ├── tokens.css        ← Design tokens
│   ├── global.css        ← Reset, base styles, font import
│   └── components/       ← Per-component CSS files
├── components/
│   ├── Sidebar/
│   ├── Header/
│   ├── Board/
│   │   ├── BoardView.jsx
│   │   ├── Column.jsx
│   │   └── TaskCard.jsx
│   ├── Modals/
│   │   ├── TaskModal.jsx
│   │   ├── CreateTaskModal.jsx
│   │   ├── EditBoardModal.jsx
│   │   └── ConfirmDeleteModal.jsx
│   └── UI/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       ├── Checkbox.jsx
│       └── ThemeToggle.jsx
├── context/
│   ├── BoardContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useBoards.js
│   ├── useTasks.js
│   └── useColumns.js
├── api/
│   ├── boards.js
│   ├── columns.js
│   └── tasks.js
├── App.jsx
└── main.jsx
```
