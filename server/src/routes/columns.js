const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const columnController = require('../controllers/columnController');

router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Column name cannot be empty').isLength({ max: 80 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code'),
], columnController.updateColumn);

router.delete('/:id', columnController.deleteColumn);

module.exports = router;
