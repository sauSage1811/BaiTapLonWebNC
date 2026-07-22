const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", orderController.index);
router.get("/history", orderController.history);
router.get("/:id", orderController.show);
router.post("/", orderController.store);
router.post("/:id/items", orderController.addItem);
router.patch("/:id/items/:itemId", orderController.updateItem);
router.delete("/:id/items/:itemId", orderController.deleteItem);
router.post("/:id/pay", orderController.pay);
router.post("/:id/cancel", orderController.cancel);
router.delete("/:id", orderController.cancel);

module.exports = router;
