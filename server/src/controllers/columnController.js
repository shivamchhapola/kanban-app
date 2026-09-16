const prisma = require('../utils/prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// PUT /api/columns/:id — update column name and/or color
exports.updateColumn = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, color } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;

  const column = await prisma.column.update({
    where: { id: Number(req.params.id) },
    data,
  });

  res.json(column);
});

// DELETE /api/columns/:id — delete column (cascades tasks + subtasks)
exports.deleteColumn = asyncHandler(async (req, res) => {
  await prisma.column.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});
