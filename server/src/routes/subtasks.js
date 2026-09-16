const express = require('express');
const router = express.Router();
const subtaskController = require('../controllers/subtaskController');

// Toggle completion state
router.patch('/:id/toggle', subtaskController.toggleSubtask);

module.exports = router;
