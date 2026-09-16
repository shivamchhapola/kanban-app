# Architecture

## Overview

The application follows a classic client-server architecture with a clear separation between the React frontend and the Express REST API backend. PostgreSQL serves as the single source of truth, accessed exclusively through Prisma ORM.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│   React App (Vite dev server, port 5173)                 │
│   ├── Context (BoardContext, ThemeContext)                │
│   ├── Custom Hooks (useBoards, useTasks, …)              │
│   └── API Client (fetch wrappers in /src/api/)           │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP REST (JSON)
                         │  localhost:5000/api
┌────────────────────────▼────────────────────────────────┐
│               Express Server (port 5000)                  │
│                                                          │
│   Middleware stack:                                       │
│   ├── morgan  → HTTP access log                          │
│   ├── cors    → allow Vite origin                        │
│   ├── express.json()                                      │
│   ├── Validation middleware (per-route)                   │
│   └── Global error handler                               │
│                                                          │
│   Routes → Controllers → Prisma Client → PostgreSQL      │
└─────────────────────────────────────────────────────────┘
```

---

## Why This Stack?

### React + Vite (not Next.js)

Next.js adds SSR complexity that is unnecessary for a fully client-rendered Kanban tool. Vite gives instant HMR and a simple build pipeline without the overhead.

### Plain CSS (no Tailwind, no component library)

The requirements explicitly forbid external UI kits. Plain CSS with custom properties (design tokens) gives full control over theming, hover states, and animations without fighting a framework.

### Express REST (not GraphQL)

The data model is simple and hierarchical (Board → Column → Task → Subtask). REST maps cleanly to CRUD operations on these resources. GraphQL would add schema boilerplate and a resolver layer without meaningful benefit at this scale.

### Prisma (not Knex or raw SQL)

Prisma provides:
- Type-safe query builder auto-generated from the schema
- First-class migration tooling (`prisma migrate dev`)
- Readable `schema.prisma` that acts as a single source of truth for DB structure
- Easy cascade rules via relation fields

The tradeoff vs Knex is slightly less raw control over SQL, which is acceptable here.

### PostgreSQL

Relational data with clear foreign-key relationships makes PostgreSQL a natural fit. The ordered nature of columns and tasks (position field) is straightforward to model relationally.

---

## Frontend Architecture

### State Management Strategy

All stateful logic lives in React hooks — no Redux, no Zustand. Two Context providers exist at the app root:

| Context | Responsibility |
|---|---|
| `BoardContext` | Active board, list of boards, CRUD operations |
| `ThemeContext` | Current theme (dark/light), toggle, localStorage persistence |

Custom hooks (`useBoards`, `useTasks`, `useColumns`) encapsulate fetch calls + local state updates so components stay declarative.

**Why not a global store like Zustand?**
The app has one primary data axis (the active board and its children). Context + hooks avoids an extra dependency and keeps the data flow explicit.

### Component Hierarchy

```
App
├── ThemeProvider
└── BoardProvider
    ├── Sidebar
    │   ├── BoardList
    │   │   └── BoardItem (× n)
    │   └── CreateBoardButton
    └── MainContent
        ├── Header (board title, + Add Task)
        ├── BoardView
        │   ├── Column (× n)
        │   │   └── TaskCard (× n)
        │   └── AddColumnButton
        └── Modals
            ├── TaskModal (view/edit task + subtasks)
            ├── CreateTaskModal
            └── ConfirmDeleteModal
```

### Form Validation

Validation runs on submit — no live validation to avoid premature error messages. Each form field has an error state piece (`titleError`, `descError`) managed locally in the form component. The server also validates and returns structured errors that surface the same field-level messages.

### API Client Layer

`client/src/api/` contains thin wrapper functions over `fetch`. Every function:
1. Constructs the URL from a base URL constant
2. Sends JSON
3. Parses the response
4. Throws a structured error if `!response.ok`

This keeps components completely free of `fetch` calls and makes it trivial to swap the transport layer later.

---

## Backend Architecture

### Request Lifecycle

```
Incoming Request
       │
       ▼
   Morgan log
       │
       ▼
   CORS check
       │
       ▼
   Route match  ──────────────────► 404 handler
       │
       ▼
   Validation middleware  ─────────► 400 Bad Request
       │
       ▼
   Controller function
       │
       ▼
   Prisma query  ─────────────────► Prisma error → error handler
       │
       ▼
   JSON response (200 / 201)
```

### Error Handling

A single `errorHandler` middleware at the bottom of the middleware stack catches everything. Controllers use a thin `asyncHandler` wrapper that passes any thrown error to `next()`, keeping try/catch out of route code.

HTTP status codes follow standard conventions:
- `200` — successful read/update
- `201` — successful create
- `204` — successful delete (no body)
- `400` — validation failure (returns `{ errors: [...] }`)
- `404` — resource not found
- `500` — unexpected server error

### Logging

| Logger | Scope | Output |
|---|---|---|
| Morgan (combined) | HTTP request/response | stdout + `logs/access.log` |
| Winston | App-level events (errors, warnings, startup) | stdout + `logs/app.log` |

Winston log levels: `error > warn > info > debug`. `LOG_LEVEL` env var controls verbosity.

---

## Database Architecture

See `docs/database.md` for the full schema and design decisions.

---

## Performance Considerations

- **Eager loading**: When fetching a board (`GET /boards/:id`), the query uses Prisma `include` to join columns, tasks, and subtasks in a single DB round trip instead of N+1 queries.
- **`position` ordering**: Columns and tasks each have a `position` integer. Ordering is done in the DB query (`orderBy: { position: 'asc' }`), not in JavaScript.
- **Cascade deletes**: Defined at the DB level via Prisma `onDelete: Cascade` so deleting a board removes all children without application-level iteration.
- **Indexes**: Foreign key columns (`columnId`, `boardId`, `taskId`) are automatically indexed by PostgreSQL when defined as FK constraints via Prisma.

---

## Scalability Considerations (theoretical)

While this is a single-user application, the design supports extension:

| Concern | Current approach | How it scales |
|---|---|---|
| Users / auth | Not implemented | Add a `User` model, JWT middleware, and scope all queries by `userId` |
| Real-time updates | Polling or manual refresh | Replace fetch calls with WebSocket subscriptions (Socket.io) |
| Large boards | Full board fetch | Paginate tasks per column via cursor-based pagination |
| Multiple servers | Stateless Express | No session state on server — scales horizontally behind a load balancer |
