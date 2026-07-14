const payOrderModel = require('../models/payOrderModel');

async function payOrder(req, res) {
    const { order_id } = req.body;
    if (!order_id) {
        return res.status(400).json({ success: false, message: "Thiếu ID đơn hàng cần thanh toán" });
    }

    try {
        const order = await payOrderModel.getOrderDetails(order_id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }
        if (order.status === 'paid') {
            return res.status(400).json({ success: false, message: "Đơn hàng này đã được thanh toán trước đó" });
        }

        await payOrderModel.updateOrderStatusToPaid(order_id);
        await payOrderModel.releaseTable(order.table_id);

        res.json({ 
            success: true, 
            message: "Thanh toán thành công & Bàn đã chuyển về 'empty'!", 
            total_amount: order.total_amount 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = payOrder;