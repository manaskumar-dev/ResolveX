const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const authController = require("../controllers/authController");

router.post("/login", authController.loginUser);
router.post("/signup", authController.createUser);
router.delete("/delete", authMiddleware, authController.deleteUser);

module.exports = router;