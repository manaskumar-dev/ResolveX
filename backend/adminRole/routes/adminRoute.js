const express = require("express");
const router = express.Router();

const authMiddleware = require("../../userRole/middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");
const adminController = require("../controllers/adminController");

router.post("/createAgent", authMiddleware, adminOnly, adminController.createAgent);

router.get("/allUsers", authMiddleware, adminOnly, adminController.getAllUsers);

router.get("/allAgents", authMiddleware, adminOnly, adminController.getAllAgents);

router.get("/allComplaints", authMiddleware, adminOnly, adminController.getAllComplaints);

router.get("/unassignedComplaints", authMiddleware, adminOnly, adminController.getUnassignedComplaints);

router.get("/allAgentByCategory/:ticketId", authMiddleware, adminOnly, adminController.getAgentByCategory);

router.post("/assignComplaint/:ticketId", authMiddleware, adminOnly, adminController.assignComplaint);

module.exports = router;