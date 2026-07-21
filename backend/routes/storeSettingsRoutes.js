const express = require("express");
const router = express.Router();

const storeSettingsController = require("../controllers/storeSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, storeSettingsController.show);
router.put("/", authMiddleware, roleMiddleware("admin"), storeSettingsController.update);

module.exports = router;
