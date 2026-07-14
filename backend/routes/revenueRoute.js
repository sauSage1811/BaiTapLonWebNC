const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

router.get('/revenue', revenueController);

module.exports = router;