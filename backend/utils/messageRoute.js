const express = require("express");
const router = express.Router();

const messageController = require("./messageController");

const authMiddleware = require("../userRole/middlewares/authMiddleware");
const agentOnly = require("../agentRole/middlewares/agentOnly");
const userOnly = require("../userRole/middlewares/userOnly");

router.post(
    "/user/complaint/:ticketId/message",
    authMiddleware,
    userOnly,
    messageController.sendMessage
);

router.get(
    "/user/complaint/:ticketId/messages",
    authMiddleware,
    userOnly,
    messageController.getMessages
);

router.post(
    "/agent/complaint/:ticketId/message",
    authMiddleware,
    agentOnly,
    messageController.sendMessage
);

router.get(
    "/agent/complaint/:ticketId/messages",
    authMiddleware,
    agentOnly,
    messageController.getMessages
);


module.exports = router;
