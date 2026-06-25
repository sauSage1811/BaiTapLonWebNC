const express = require('express');
const router = express.Router();
const payOrderController = require('../controllers/payOrderController');

router.post('/pay', payOrderController);

module.exports = router;