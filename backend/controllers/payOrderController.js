const payOrderModel = require('../models/payOrderModel');

// Lấy thông tin hóa đơn hiển thị lên màn hình thanh toán
async function getOrderDetail(req, res) {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Thiếu ID đơn hàng!" });
    }

    try {
        const order = await payOrderModel.getOrderSummary(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Chốt thanh toán
async function payOrder(req, res) {
    const { order_id } = req.body;
    if (!order_id) {
        return res.status(400).json({ success: false, message: "Thieu ID don hang can thanh toan" });
    }

    try {
        const order = await payOrderModel.getOrderSummary(order_id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Khong tim thay don hang" });
        }
        if (order.status === 'paid') {
            return res.status(400).json({ success: false, message: "Don hang nay da duoc thanh toan truoc do" });
        }

        await payOrderModel.markOrderPaidAndOccupyTable(order_id, order.table_id);

        res.json({
            success: true,
            message: "Thanh toan thanh cong va ban da chuyen sang dang su dung",
            total_amount: order.total_amount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getOrderDetail,
    payOrder
};