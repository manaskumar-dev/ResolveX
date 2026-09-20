const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/review/:ticketId", authMiddleware, reviewController.addReview);

module.exports = router;