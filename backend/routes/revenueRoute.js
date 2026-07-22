const express = require("express");
const revenueController = require("../controllers/revenueController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/revenue", authMiddleware, roleMiddleware("admin"), revenueController);

module.exports = router;
