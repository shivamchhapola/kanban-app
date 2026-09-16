const prisma = require('../utils/prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// GET /api/tasks/:id
exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: Number(req.params.id) },
    include: { subtasks: true },
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description = '', columnId, subtasks = [] } = req.body;

  // Validate subtask titles
  for (const st of subtasks) {
    if (!st.title || !st.title.trim()) {
      return res.status(400).json({ errors: [{ field: 'subtasks', message: 'Each subtask must have a title' }] });
    }
  }

  // Get next position in the column
  const last = await prisma.task.findFirst({
    where: { columnId: Number(columnId) },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = last ? last.position + 1 : 0;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      position,
      columnId: Number(columnId),
      subtasks: {
        create: subtasks.map((st) => ({ title: st.title.trim() })),
      },
    },
    include: { subtasks: true },
  });

  res.status(201).json(task);
});

// PUT /api/tasks/:id
exports.updateTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const taskId = Number(req.params.id);
  const { title, description, columnId, position, subtasks } = req.body;

  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (columnId !== undefined) data.columnId = Number(columnId);
  if (position !== undefined) data.position = Number(position);

  // Handle subtask upsert/delete
  if (subtasks !== undefined) {
    // Delete all existing subtasks and recreate (simpler than diffing)
    await prisma.subtask.deleteMany({ where: { taskId } });
    data.subtasks = {
      create: subtasks.map((st) => ({
        title: st.title,
        isCompleted: st.isCompleted ?? false,
      })),
    };
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: { subtasks: true },
  });

  res.json(task);
});

// DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  await prisma.task.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});
