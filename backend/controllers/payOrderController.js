const payOrderModel = require('../models/payOrderModel');

// 1. Lấy danh sách đơn hàng (hỗ trợ lọc theo table_id cho trang chọn bàn)
async function getOrders(req, res) {
    const { table_id } = req.query;
    try {
        let orders = [];
        if (table_id) {
            orders = await payOrderModel.getOrdersByTableId(table_id);
        }
        return res.json({
            success: true,
            data: orders
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// 2. Lấy thông tin hóa đơn hiển thị lên màn hình thanh toán
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

// 3. Chốt thanh toán
async function payOrder(req, res) {
    const { order_id } = req.body;
    if (!order_id) {
        return res.status(400).json({ success: false, message: "Thiếu ID đơn hàng cần thanh toán" });
    }

    try {
        const order = await payOrderModel.getOrderSummary(order_id);
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

// 4. Xóa đơn hàng
async function deleteOrder(req, res) {
    const orderId = req.params.id;
    try {
        const order = await payOrderModel.getOrderSummary(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }
        await payOrderModel.deleteOrderById(orderId);
        if (order.status !== 'paid' && order.table_id) {
            await payOrderModel.releaseTable(order.table_id);
        }
        return res.json({ success: true, message: "Xóa đơn hàng thành công!" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getOrders,       // 👈 Thêm hàm này để map vào route GET /
    getOrderDetail,
    payOrder,
    deleteOrder
};