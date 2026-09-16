const prisma = require('../utils/prisma');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// GET /api/boards — list all boards (id + name only)
exports.getAllBoards = asyncHandler(async (req, res) => {
  const boards = await prisma.board.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(boards);
});

// POST /api/boards — create board (optionally with initial columns)
exports.createBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, columns = [] } = req.body;

  const board = await prisma.board.create({
    data: {
      name,
      columns: {
        create: columns.map((col, i) => ({
          name: col.name,
          color: col.color || '#635FC7',
          position: i,
        })),
      },
    },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: { orderBy: { position: 'asc' }, include: { subtasks: true } },
        },
      },
    },
  });

  res.status(201).json(board);
});

// GET /api/boards/:id — get board with all columns, tasks, subtasks
exports.getBoardById = asyncHandler(async (req, res) => {
  const board = await prisma.board.findUnique({
    where: { id: Number(req.params.id) },
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

  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json(board);
});

// PUT /api/boards/:id — update board name and/or columns
exports.updateBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const boardId = Number(req.params.id);
  const { name, columns } = req.body;

  if (columns && Array.isArray(columns)) {
    const existingCols = await prisma.column.findMany({ where: { boardId } });
    const existingIds = new Set(existingCols.map(c => c.id));
    const incomingIds = new Set(
      columns
        .filter(c => c.id && typeof c.id === 'number' && !String(c.id).includes('.'))
        .map(c => Number(c.id))
    );

    // Delete removed columns
    const toDelete = existingCols.filter(c => !incomingIds.has(c.id)).map(c => c.id);
    if (toDelete.length) {
      await prisma.column.deleteMany({ where: { id: { in: toDelete } } });
    }

    // Update / Create columns
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const colId = Number(col.id);
      if (col.id && existingIds.has(colId)) {
        await prisma.column.update({
          where: { id: colId },
          data: { name: col.name, color: col.color || '#635FC7', position: i },
        });
      } else {
        await prisma.column.create({
          data: { name: col.name, color: col.color || '#635FC7', position: i, boardId },
        });
      }
    }
  }

  const board = await prisma.board.update({
    where: { id: boardId },
    data: { name },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: { orderBy: { position: 'asc' }, include: { subtasks: true } },
        },
      },
    },
  });

  res.json(board);
});

// DELETE /api/boards/:id — delete board (cascades to columns, tasks, subtasks)
exports.deleteBoard = asyncHandler(async (req, res) => {
  await prisma.board.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

// POST /api/boards/:id/columns — add a column to the board
exports.addColumn = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const boardId = Number(req.params.id);
  const { name, color = '#635FC7' } = req.body;

  // Get the next position
  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = last ? last.position + 1 : 0;

  const column = await prisma.column.create({
    data: { name, color, position, boardId },
  });

  res.status(201).json(column);
});
