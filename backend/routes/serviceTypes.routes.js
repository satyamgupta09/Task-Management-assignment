const router = require('express').Router();

const authenticate = require('../middleware/auth');
const requiredRole = require('../middleware/role');
const { getAllServiceTypes, getServiceTypeById, createServiceType, updateServiceType } = require('../controllers/serviceTypes.controller.js');

// admin + Manager can view all service types
router.get('/', authenticate, requiredRole('admin', 'manager'), getAllServiceTypes);

// admin + Manager can view a specific service type
router.get('/:id', authenticate, requiredRole('admin', 'manager'), getServiceTypeById);

// admin can create a new service type
router.post('/', authenticate, requiredRole('admin'), createServiceType);

// admin can update an existing service type
router.put('/:id', authenticate, requiredRole('admin'), updateServiceType);

module.exports = router;
