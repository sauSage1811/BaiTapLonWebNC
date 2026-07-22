const express = require('express');
const router = express.Router();


const { getOrders, getOrderDetail, payOrder, deleteOrder } = require('../controllers/payOrderController');

// GET /api/orders?table_id=.. Lấy danh sách đơn hàng 
router.get('/', getOrders);

// GET /api/orders/:id -> Xem thông tin chi tiết hóa đơn
router.get('/:id', getOrderDetail);

// POST /api/orders/pay  Thực hiện chốt thanh toán
router.post('/pay', payOrder);

// DELETE /api/orders/:id Xóa đơn hàng
router.delete('/:id', deleteOrder);

module.exports = router;