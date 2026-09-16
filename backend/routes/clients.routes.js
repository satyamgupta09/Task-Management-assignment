const router = require('express').Router();

const authenticate = require('../middleware/auth');
const requiredRole = require('../middleware/role');
const { getAllClients, getClientById, createClient, updateClient } = require('../controllers/clients.controller.js');

// Admin + Manager can view all clients
router.get('/', authenticate, requiredRole('admin', 'manager'), getAllClients);

//admint + Manager can view a specific client
router.get('/:id', authenticate, requiredRole('admin', 'manager'), getClientById);

// create a new client(admin bro only)
router.post('/',authenticate, requiredRole('admin'), createClient);

// update client by admin only
router.put('/:id', authenticate, requiredRole('admin'), updateClient);

module.exports = router;
