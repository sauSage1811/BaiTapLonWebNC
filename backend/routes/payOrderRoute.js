const express = require('express');
const router = express.Router();
const { getOrderDetail, payOrder } = require('../controllers/payOrderController');

// GET /api/orders/:id -> Xem thông tin chi tiết hóa đơn
router.get('/:id', getOrderDetail);

// POST /api/orders/pay -> Thực hiện chốt thanh toán
router.post('/pay', payOrder);

module.exports = router;