const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Moi nguoi co the xem
router.get("/", authMiddleware, tableController.index);
router.get("/:id", authMiddleware, tableController.show);

// chi admin create/update/delete
router.post("/", authMiddleware, roleMiddleware("admin"), tableController.store);
router.put("/:id", authMiddleware, roleMiddleware("admin"), tableController.update);
router.put("/:id/status", authMiddleware, tableController.updateStatus);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), tableController.destroy);

module.exports = router;
