const express = require('express');
const router = express.Router();
const { getOrderHistory, getOrderDetail } = require('../controllers/orderHistoryController');


router.get('/history', getOrderHistory);
router.get('/:orderId', getOrderDetail);

module.exports = router;