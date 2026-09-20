const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/profile", authMiddleware, userController.viewProfile);

router.put("/profile", authMiddleware, userController.updateProfile);

router.post("/regComplain", authMiddleware, userController.createComplaint);

router.get("/allComplaints", authMiddleware, userController.allComplaints);

router.get("/complaint/:ticketId", authMiddleware, userController.singleComplain);

router.get('/completedComplaints', authMiddleware, userController.completedComplaints);

module.exports = router;