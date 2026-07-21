const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Everyone can read
router.get("/", authMiddleware, tableController.index);
router.get("/available", authMiddleware, tableController.available);
router.get("/:id/latest-paid-order", authMiddleware, tableController.latestPaidOrder);
router.get("/:id", authMiddleware, tableController.show);

// Only admin can create/update/delete
router.post("/", authMiddleware, roleMiddleware("admin"), tableController.store);
router.put("/:id", authMiddleware, roleMiddleware("admin"), tableController.update);
router.put("/:id/status", authMiddleware, tableController.updateStatus);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), tableController.destroy);

module.exports = router;
