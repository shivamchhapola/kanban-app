# Database Design

## Entity-Relationship Diagram

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Board   │1      *│  Column  │1      *│   Task   │1      *│ Subtask  │
│──────────│────────│──────────│────────│──────────│────────│──────────│
│ id       │        │ id       │        │ id       │        │ id       │
│ name     │        │ name     │        │ title    │        │ title    │
│ createdAt│        │ color    │        │ description│       │ isCompleted│
│ updatedAt│        │ position │        │ columnId │        │ taskId   │
│          │        │ boardId  │        │ position │        │ createdAt│
│          │        │ createdAt│        │ createdAt│        │ updatedAt│
│          │        │ updatedAt│        │ updatedAt│        │          │
└──────────┘        └──────────┘        └──────────┘        └──────────┘
```

---

## Prisma Schema

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Board {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(120)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  columns   Column[]
}

model Column {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(80)
  color     String   @default("#635FC7") @db.VarChar(7)
  position  Int
  boardId   Int
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([boardId])
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  description String?   @db.Text
  position    Int
  columnId    Int
  column      Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  subtasks    Subtask[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([columnId])
}

model Subtask {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(255)
  isCompleted Boolean  @default(false)
  taskId      Int
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([taskId])
}
```

---

## Design Decisions

### Why `position` instead of a linked list?

Two common patterns for ordered lists in SQL:

| Pattern | Pros | Cons |
|---|---|---|
| Integer `position` | Simple queries, easy sorting | Reordering can require updating multiple rows |
| Linked list (`nextId`) | O(1) reorder | Complex queries, harder to paginate |

For a Kanban board with a bounded number of columns (typically < 10) and tasks per column (typically < 100), the `position` integer is the pragmatic choice. Reordering N rows in a transaction is fast and simple.

### Why `onDelete: Cascade`?

Deleting a Board should atomically remove all its Columns, Tasks, and Subtasks. Defining this at the database level (not application level) ensures referential integrity even if something bypasses the API. Prisma's `onDelete: Cascade` directive translates directly to a PostgreSQL `ON DELETE CASCADE` foreign key constraint.

### Why `color` on Column?

The reference design shows each column header with a colored dot (teal, purple, green). Storing color per-column keeps it flexible — users can assign meaningful colors to statuses without hardcoding them in the UI.

### Why `VarChar` limits?

- Board name: 120 chars — enough for descriptive names, prevents garbage data
- Column name: 80 chars — statuses are short
- Task title: 255 chars — standard for short text fields
- Task description: `Text` (unlimited) — descriptions can be long

### Auto-increment IDs vs UUIDs

Integer auto-increment is used for simplicity. If the app ever became multi-tenant or required distributed IDs, switching to UUID (`@default(uuid())`) is a one-line Prisma schema change + migration.

---

## Indexes

| Table | Indexed Column | Reason |
|---|---|---|
| `Column` | `boardId` | Every board fetch joins on `boardId` |
| `Task` | `columnId` | Every column render fetches tasks by `columnId` |
| `Subtask` | `taskId` | Task detail view fetches subtasks by `taskId` |

PostgreSQL also creates implicit indexes for all primary keys and unique constraints.

---

## Query Patterns

### Fetch board with all data (most common read)

```typescript
// Single round-trip: board + columns (ordered) + tasks (ordered) + subtasks
const board = await prisma.board.findUnique({
  where: { id },
  include: {
    columns: {
      orderBy: { position: 'asc' },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
          include: { subtasks: true },
        },
      },
    },
  },
});
```

This is a single SQL query with three JOINs. It avoids N+1 query problems entirely.

### Moving a task to a different column

```typescript
// Update the task's columnId and recalculate positions
await prisma.$transaction([
  prisma.task.update({ where: { id: taskId }, data: { columnId, position: newPos } }),
]);
```

Using a Prisma transaction ensures consistency if position recalculation involves multiple updates.

---

## Seed Data

`server/prisma/seed.ts` creates one demo board ("Platform Launch") with three columns (TODO, DOING, DONE) and sample tasks, mirroring the reference design screenshot. This allows immediate visual testing after setup.
