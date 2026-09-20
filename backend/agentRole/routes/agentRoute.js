const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");
const userController = require("../../userRole/controllers/userController");
const authMiddleware = require("../../userRole/middlewares/authMiddleware");
const agentOnly = require("../middlewares/agentOnly");

router.get("/allComplaints", authMiddleware, agentOnly, agentController.viewComplainByCategory);

router.get("/complaint/:ticketId", authMiddleware, agentOnly, userController.singleComplain);

router.put("/complaint/:ticketId/in-progress", authMiddleware, agentOnly, agentController.updateStatusInProgress);

router.put("/complaint/:ticketId/resolve", authMiddleware, agentOnly, agentController.updateStatusResolved);

module.exports = router;