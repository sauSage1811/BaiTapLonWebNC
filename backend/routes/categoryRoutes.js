const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin only
router.get("/", authMiddleware, categoryController.index);
router.get("/:id", authMiddleware, categoryController.show);
router.post("/", authMiddleware, roleMiddleware("admin"), categoryController.store);
router.put("/:id", authMiddleware, roleMiddleware("admin"), categoryController.update);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), categoryController.destroy);

module.exports = router;
