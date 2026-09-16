# API Reference

Base URL: `http://localhost:5000/api`

All request bodies are JSON. All responses are JSON. Dates are ISO 8601 strings.

---

## Boards

### `GET /boards`

Returns a list of all boards (name + id only, no columns).

**Response 200**
```json
[
  { "id": 1, "name": "Platform Launch" },
  { "id": 2, "name": "Marketing Plan" }
]
```

---

### `POST /boards`

Creates a new board. Optionally accepts an initial set of columns.

**Request body**
```json
{
  "name": "Roadmap",
  "columns": [
    { "name": "Todo", "color": "#49C4E5" },
    { "name": "Doing", "color": "#8471F2" }
  ]
}
```

**Validation**
- `name` — required, 1–120 characters

**Response 201**
```json
{
  "id": 3,
  "name": "Roadmap",
  "columns": [
    { "id": 7, "name": "Todo", "color": "#49C4E5", "position": 0 }
  ]
}
```

**Response 400**
```json
{ "errors": [{ "field": "name", "message": "Name is required" }] }
```

---

### `GET /boards/:id`

Returns a board with all its columns, tasks (ordered), and subtasks.

**Response 200**
```json
{
  "id": 1,
  "name": "Platform Launch",
  "columns": [
    {
      "id": 1,
      "name": "Todo",
      "color": "#49C4E5",
      "position": 0,
      "tasks": [
        {
          "id": 1,
          "title": "Build UI for onboarding flow",
          "description": "",
          "position": 0,
          "subtasks": [
            { "id": 1, "title": "Sign up page", "isCompleted": false },
            { "id": 2, "title": "Sign in page", "isCompleted": false },
            { "id": 3, "title": "Welcome page", "isCompleted": false }
          ]
        }
      ]
    }
  ]
}
```

**Response 404**
```json
{ "error": "Board not found" }
```

---

### `PUT /boards/:id`

Updates the board name.

**Request body**
```json
{ "name": "New Name" }
```

**Response 200** — updated board object (same shape as GET)

---

### `DELETE /boards/:id`

Deletes the board and all child resources (cascade).

**Response 204** — no body

---

## Columns

### `POST /boards/:boardId/columns`

Adds a column to a board.

**Request body**
```json
{ "name": "Review", "color": "#67E2AE" }
```

**Validation**
- `name` — required, 1–80 characters
- `color` — optional, must be a valid hex color if provided

**Response 201**
```json
{ "id": 8, "name": "Review", "color": "#67E2AE", "position": 2, "boardId": 1 }
```

---

### `PUT /columns/:id`

Updates a column's name and/or color.

**Request body**
```json
{ "name": "In Review", "color": "#EA5555" }
```

**Response 200** — updated column object

---

### `DELETE /columns/:id`

Deletes the column and all its tasks (cascade).

**Response 204** — no body

---

## Tasks

### `GET /tasks/:id`

Returns a single task with its subtasks.

**Response 200**
```json
{
  "id": 1,
  "title": "Build UI for onboarding flow",
  "description": "We need to build..",
  "position": 0,
  "columnId": 1,
  "subtasks": [
    { "id": 1, "title": "Sign up page", "isCompleted": false },
    { "id": 2, "title": "Sign in page", "isCompleted": true }
  ]
}
```

---

### `POST /tasks`

Creates a task in a column.

**Request body**
```json
{
  "title": "New Task",
  "description": "Optional description",
  "columnId": 1,
  "subtasks": [
    { "title": "Step one" },
    { "title": "Step two" }
  ]
}
```

**Validation**
- `title` — required, 1–255 characters
- `columnId` — required, must reference an existing column
- `subtasks[].title` — required if subtask is provided

**Response 201** — full task object with subtasks

---

### `PUT /tasks/:id`

Updates task title, description, column (move), or position.

**Request body** (all fields optional, at least one required)
```json
{
  "title": "Updated title",
  "description": "Updated desc",
  "columnId": 2,
  "subtasks": [
    { "id": 1, "title": "Updated step", "isCompleted": true },
    { "title": "New step" }
  ]
}
```

Subtask handling:
- Subtasks with an `id` are updated in-place
- Subtasks without an `id` are created fresh
- Subtasks present in DB but absent from the request body are deleted

**Response 200** — full updated task object

---

### `DELETE /tasks/:id`

Deletes the task and all its subtasks.

**Response 204** — no body

---

## Subtasks

### `PATCH /subtasks/:id/toggle`

Toggles the `isCompleted` state of a subtask.

**Response 200**
```json
{ "id": 1, "isCompleted": true }
```

---

## Error Format

All error responses follow a consistent shape:

```json
// Validation error (400)
{
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}

// Not found (404)
{ "error": "Task not found" }

// Server error (500)
{ "error": "Internal server error" }
```

---

## HTTP Status Code Reference

| Code | Meaning |
|---|---|
| 200 | OK — successful read or update |
| 201 | Created — resource successfully created |
| 204 | No Content — successful delete |
| 400 | Bad Request — validation failed |
| 404 | Not Found — resource does not exist |
| 500 | Internal Server Error — unexpected failure |
