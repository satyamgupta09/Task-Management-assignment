const router = require('express').Router();

const authenticate = require('../middleware/auth');
const requiredRole = require('../middleware/role');
const { getAllTaskTemplates, getTaskTemplateById, createTaskTemplate, updateTaskTemplate } = require('../controllers/taskTemplates.controller.js');

// Get all task templates
router.get('/', authenticate, getAllTaskTemplates);

//specific task template by ie
router.get('/:id', authenticate, getTaskTemplateById);

// admin only can create a task template
router.post('/', authenticate, requiredRole('admin'), createTaskTemplate);

// admin only update
router.put('/:id', authenticate, requiredRole('admin'), updateTaskTemplate);

module.exports = router;
