const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Everyone can read
router.get("/", authMiddleware, productController.index);
router.get("/:id", authMiddleware, productController.show);

// Only admin can create/update/delete
router.post("/", authMiddleware, roleMiddleware("admin"), productController.store);
router.put("/:id", authMiddleware, roleMiddleware("admin"), productController.update);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), productController.destroy);

module.exports = router;