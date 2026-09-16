const router = require('express').Router();

const authenticate = require("../middleware/auth");
const requiredRole = require("../middleware/role");
const { getAllEngagements, getEngagementById, createEngagement, updateEngagement, createNextPeriodEngagement } = require('../controllers/engagements.controller.js');

// admin + Manager can view all engagements
router.get("/", authenticate, requiredRole("manager", "admin"), getAllEngagements);

// admin + Manager can view a specific engagement
router.get("/:id", authenticate, requiredRole("manager", "admin"), getEngagementById);

// manager can create a new engagement
router.post("/", authenticate, requiredRole("manager"), createEngagement);

// manager can update an existing engagement
router.put("/:id", authenticate, requiredRole("manager"), updateEngagement);

// manager can set an engagement next period
router.post("/:id/next-period", authenticate, requiredRole("manager"), createNextPeriodEngagement);

module.exports = router;
