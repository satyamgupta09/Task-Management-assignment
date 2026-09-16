const router = require('express').Router();

const authenticate = require('../middleware/auth');
const requiredRole = require('../middleware/role');
const { getAllTasks, getDashboard, getTaskById, updateTaskStatus, updateTaskAssignee, updateTaskDeadline, waitingForClient, submitTask, approveTask, requestChanges } = require('../controllers/tasks.controller.js');

// admin + Manager can view all tasks
router.get('/', authenticate, getAllTasks);

// dasboard for all
router.get('/dashboard', authenticate, getDashboard);

// get task by id
router.get('/:id', authenticate, getTaskById);

// 
router.put('/:id/status', authenticate, updateTaskStatus);

// Update task assignee
router.put('/:id/assignedTo', authenticate, updateTaskAssignee);

// deadline update
router.put('/:id/deadline', authenticate, requiredRole('manager'), updateTaskDeadline);

// waiting for client
router.post('/:id/waiting-for-client', authenticate, requiredRole('team member'), waitingForClient);

// ready for review
router.post('/:id/submit', authenticate, requiredRole('team member'), submitTask);

// completed
router.post('/:id/approve', authenticate, requiredRole('manager'), approveTask);

// change requested
router.post('/:id/changes-requested', authenticate, requiredRole('manager'), requestChanges);

module.exports = router;
