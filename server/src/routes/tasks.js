const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');

const titleValidation = body('title')
  .trim()
  .notEmpty().withMessage('Task title is required')
  .isLength({ max: 255 }).withMessage('Title must be 255 characters or fewer');

router.get('/:id', taskController.getTaskById);

router.post('/', [
  titleValidation,
  body('columnId').isInt({ min: 1 }).withMessage('A valid columnId is required'),
], taskController.createTask);

router.put('/:id', [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('columnId').optional().isInt({ min: 1 }),
], taskController.updateTask);

router.delete('/:id', taskController.deleteTask);

module.exports = router;
