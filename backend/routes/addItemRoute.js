const express = require('express');
const router = express.Router();
const addItemController = require('../controllers/addItemController');
const authMiddleware = require('../middleware/authMiddleware');

// Staff and Admin can add items to orders
router.post('/add-item', authMiddleware, addItemController);

module.exports = router;