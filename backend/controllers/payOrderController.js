const payOrderModel = require('../models/payOrderModel');

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

module.exports = payOrder;
