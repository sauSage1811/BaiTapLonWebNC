const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/overview", dashboardController.overview);
router.get("/revenue", dashboardController.revenue);
router.get("/top-products", dashboardController.topProducts);
router.get("/recent-orders", dashboardController.recentOrders);

module.exports = router;
