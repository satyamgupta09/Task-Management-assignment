const router = require('express').Router();

const authenticate = require("../middleware/auth");
const requiredRole = require("../middleware/role");
const { getAllUsers, getTeamMembers, getUserById, createUser, updateUser } = require('../controllers/users.controller.js');

// get all users (admin only)
router.get("/", authenticate, requiredRole("admin"), getAllUsers);

// get all team members (admin + manager)
router.get("/team-members", authenticate, requiredRole("manager", "admin"), getTeamMembers);

// get a user by id (admin only)
router.get("/:id", authenticate, requiredRole("admin"), getUserById);

// create user (admin only)
router.post("/", authenticate, requiredRole("admin"), createUser);

// update user (admin only)
router.put("/:id", authenticate, requiredRole("admin"), updateUser);

module.exports = router;
