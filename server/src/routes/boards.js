const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const boardController = require('../controllers/boardController');

const nameValidation = body('name')
  .trim()
  .notEmpty().withMessage('Board name is required')
  .isLength({ max: 120 }).withMessage('Board name must be 120 characters or fewer');

router.get('/', boardController.getAllBoards);
router.post('/', [nameValidation], boardController.createBoard);
router.get('/:id', boardController.getBoardById);
router.put('/:id', [nameValidation], boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

// Column nested under board
router.post('/:id/columns', [
  body('name').trim().notEmpty().withMessage('Column name is required').isLength({ max: 80 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
], boardController.addColumn);

module.exports = router;
