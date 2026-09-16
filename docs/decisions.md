# Q&A — Technical Deep Dives

A reference document covering the rationale behind key technical decisions. Useful for articulating design choices clearly.

---

## Architecture

**Q: Why did you choose REST over GraphQL?**

The data model is a clean hierarchy: Board → Column → Task → Subtask. REST maps naturally — one endpoint per resource, standard HTTP verbs for CRUD. GraphQL would add a resolver layer, a schema definition, and query complexity without meaningful benefit for this use case. If the client needed highly flexible queries or had many different consumer shapes (e.g., a mobile app + web app with very different data needs), GraphQL would be worth considering.

---

**Q: Why Express instead of something like Fastify or Hono?**

Express is the most widely understood Node.js framework with a massive ecosystem. Given the time constraint, it reduces cognitive overhead. The performance difference between Express and Fastify is negligible at this scale (single-user Kanban). The goal was correctness and clarity, not benchmark scores.

---

**Q: The frontend and backend are separate processes — how do you handle CORS in development?**

The Express server uses the `cors` middleware configured to allow requests from `http://localhost:5173` (Vite's default dev port). In production, if they were co-located (e.g., Express serves the built React files), CORS wouldn't be needed at all.

---

**Q: Why Vite instead of Create React App?**

Create React App is effectively deprecated and not actively maintained. Vite is the current standard for React tooling — it's faster (native ESM), has a simpler config, and has first-class React support via `@vitejs/plugin-react`.

---

## Database

**Q: Why PostgreSQL and not SQLite or MongoDB?**

The data is fundamentally relational — boards have columns, columns have tasks, tasks have subtasks. Foreign key constraints and `ON DELETE CASCADE` give us referential integrity for free. SQLite would work for a single-user local app but doesn't support multiple connections well. MongoDB's document model would work but we'd lose schema enforcement and would have to manage nested document updates manually.

---

**Q: Why Prisma over Knex?**

Prisma generates a type-safe client from the schema, which means TypeScript (or JS with JSDoc) catches mistakes at development time rather than runtime. The `schema.prisma` file is also the most readable single source of truth for the DB structure — easier to explain in a walkthrough than Knex migration files. Knex gives more raw SQL control, which is useful for complex queries, but nothing in this app requires it.

---

**Q: How do you handle ordering of columns and tasks?**

Each column and task has an integer `position` field. When fetching, the DB query sorts by `position ASC`. When a new item is created, it gets `position = current_max + 1`. When items are reordered (e.g., drag-and-drop), the positions of affected items are updated in a transaction. This is O(n) writes in the worst case but fast enough for the small n values typical of a Kanban board.

---

**Q: Why cascade deletes at the DB level rather than in the application?**

If cascade logic lives in the application, it can be bypassed if someone queries the DB directly, runs a migration script, or if a bug causes the controller to skip the delete chain. Defining `ON DELETE CASCADE` in the schema means the database enforces it unconditionally, which is the safest approach.

---

**Q: How do you prevent N+1 query problems?**

The primary read (`GET /boards/:id`) uses Prisma's `include` to fetch boards + columns + tasks + subtasks in a single database query. This avoids the pattern of fetching a board, then looping over columns to fetch their tasks, which would fire one query per column.

---

## Frontend

**Q: Why Context + hooks instead of a state management library like Zustand or Redux?**

The app has one primary global concern: which board is currently active and what does it contain. React Context handles this cleanly without adding a dependency. Redux would be overkill — it's designed for complex, multi-domain state with time-travel debugging. Zustand is reasonable but still an extra dependency. The rule of thumb is to reach for external state management when Context causes performance problems (excessive re-renders) or when state logic becomes too complex — neither applies here.

---

**Q: How does the theme (dark/light mode) work?**

`ThemeContext` reads from `localStorage` on mount to restore the user's preference. The current theme is stored as a `data-theme` attribute on the `<html>` element. CSS custom properties for dark mode are scoped to `[data-theme="dark"]`, so a single attribute change flips the entire UI instantly without any JavaScript style manipulation. Toggling calls `setTheme` which updates state, updates localStorage, and updates the attribute.

---

**Q: How do you handle form validation?**

Validation runs on submit (not live/on-change). Each form component manages its own error state as plain `useState` objects keyed by field name. On submit, the fields are validated in order, errors are set, and if any exist, the submission is aborted. Errors clear when the user modifies the field. The same validation rules are mirrored on the server so a malformed direct API request is also rejected.

---

**Q: How does the API client layer work?**

`client/src/api/` contains plain async functions (e.g., `createTask`, `fetchBoard`) that wrap `fetch`. Each function constructs the URL, sets `Content-Type: application/json`, serializes the body, and parses the response. On non-2xx responses, it parses the error body and throws a structured error. This keeps all HTTP-handling in one place and makes components completely agnostic of the transport layer.

---

**Q: How are modals accessible?**

- The modal container receives `role="dialog"` and `aria-modal="true"`
- Focus is moved to the first interactive element in the modal on open
- Tab key is trapped within the modal while it is open
- Escape key closes the modal
- The backdrop has an `onClick` handler that closes the modal
- Backdrop has `aria-hidden="true"` so screen readers ignore it

---

## Logging

**Q: Why two logging libraries (Morgan + Winston)?**

Morgan is purpose-built for HTTP request logging — it integrates cleanly into Express middleware and formats access logs in standard formats (combined, dev, etc.) with minimal config. Winston is a general-purpose logger for application-level events: startup messages, database errors, business logic warnings. Combining them gives clear separation: Morgan owns the HTTP layer, Winston owns everything else. Both write to files for persistence and to stdout for development visibility.

---

**Q: What do you log?**

| Event | Logger | Level |
|---|---|---|
| Every HTTP request/response | Morgan | — (always) |
| Server startup | Winston | info |
| DB connection established | Winston | info |
| Validation error (expected) | Winston | debug |
| Resource not found (404) | Winston | warn |
| Unhandled exception | Winston | error |
| Prisma query errors | Winston | error |

---

## Scalability & Extensions

**Q: How would you add authentication?**

1. Add a `User` model with hashed password (`bcrypt`)
2. Add `userId` foreign keys to `Board`
3. Issue JWTs on login (`jsonwebtoken`)
4. Add an `authenticate` middleware that validates the JWT and attaches `req.user`
5. Scope all Prisma queries with `where: { userId: req.user.id }`

The stateless JWT approach means the Express server stays horizontally scalable — no session store needed.

---

**Q: How would you add real-time updates (e.g., collaborative boards)?**

Replace the current request/response model for board updates with WebSockets (Socket.io). When a user moves a task, the event is emitted to all other clients subscribed to that board ID. The REST API would still handle initial data load and persistent mutations; WebSockets would handle live deltas.

---

**Q: How would you handle a board with thousands of tasks?**

Cursor-based pagination per column: `GET /columns/:id/tasks?cursor=<lastTaskId>&limit=20`. The board view would render an infinite scroll or "load more" per column. The DB query uses `where: { id: { gt: cursor } }` for efficient indexed lookups.
