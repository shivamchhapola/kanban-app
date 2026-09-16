const prisma = require('../utils/prisma');
const asyncHandler = require('../middleware/asyncHandler');

// PATCH /api/subtasks/:id/toggle
exports.toggleSubtask = asyncHandler(async (req, res) => {
  const subtask = await prisma.subtask.findUnique({
    where: { id: Number(req.params.id) },
    select: { isCompleted: true },
  });

  if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

  const updated = await prisma.subtask.update({
    where: { id: Number(req.params.id) },
    data: { isCompleted: !subtask.isCompleted },
    select: { id: true, isCompleted: true, title: true },
  });

  res.json(updated);
});
