# Kanban — Full-Stack Project

A full-stack Kanban board application built with React, Node.js/Express, PostgreSQL, and Prisma ORM. Supports multiple boards, drag-and-drop columns, task management with subtasks, and a dark/light theme toggle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), plain CSS, React Hooks |
| **Backend** | Node.js + Express |
| **API Style** | REST |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Logging** | Morgan (HTTP) + Winston (app-level) |

---

## Features

- **Multi-board management** — Create, rename, and delete boards
- **Column management** — Add custom columns (e.g., TODO, DOING, DONE) per board
- **Task CRUD** — Create, read, update, delete tasks within any column
- **Subtasks** — Each task can have multiple subtasks with completion tracking
- **Form validation** — Client-side and server-side validation on all inputs
- **Hover states** — All interactive elements have hover/focus states
- **Responsive layout** — Sidebar collapses on smaller screens
- **Dark / Light mode** — Persisted via `localStorage`

---

## Project Structure

```
kanban/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React Context providers
│   │   ├── api/          # API client functions
│   │   └── styles/       # Global CSS & design tokens
│   └── index.html
│
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # Route handlers (boards, columns, tasks)
│   │   ├── controllers/  # Business logic per resource
│   │   ├── middleware/    # Validation, error handling, logging
│   │   ├── prisma/       # Prisma schema + migrations
│   │   └── utils/        # Logger, helpers
│   └── server.js
│
└── docs/                 # Architecture & design documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd kanban

# 2. Install server dependencies
cd server && npm install

# 3. Configure environment
cp .env.example .env
# Fill in DATABASE_URL in .env

# 4. Run migrations & seed
npx prisma migrate dev
npx prisma db seed

# 5. Start the server
npm run dev

# 6. In another terminal, install & start client
cd ../client && npm install && npm run dev
```

---

## Environment Variables

```env
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

---

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/boards` | List all boards |
| POST | `/boards` | Create a board |
| GET | `/boards/:id` | Get board with columns & tasks |
| PUT | `/boards/:id` | Update board name |
| DELETE | `/boards/:id` | Delete board (cascades) |
| POST | `/boards/:id/columns` | Add a column to a board |
| PUT | `/columns/:id` | Rename a column |
| DELETE | `/columns/:id` | Delete column (cascades) |
| GET | `/tasks/:id` | Get a single task with subtasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/subtasks/:id/toggle` | Toggle subtask completion |

Full details in `docs/api.md`.

---

## Database Schema Overview

```
Board  →  Column  →  Task  →  Subtask
```

Full ERD and design decisions in `docs/database.md`.

---

## Architecture

See `docs/architecture.md` for a deep-dive into the system design, decisions, and tradeoffs.
