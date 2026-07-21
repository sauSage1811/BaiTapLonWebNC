const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/me", authMiddleware, authController.me);
router.put("/me", authMiddleware, authController.updateProfile);
router.post("/change-password", authMiddleware, authController.changePassword);
router.post("/logout", authController.logout);

module.exports = router;
