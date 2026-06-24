const express = require('express');
const router = express.Router();
const createOrderController = require('../controllers/createOrderController');
const authMiddleware = require('../middleware/authMiddleware');

// Staff and Admin can create orders
router.post('/create', authMiddleware, createOrderController);

module.exports = router;