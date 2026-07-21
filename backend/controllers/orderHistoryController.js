const OrderHistoryModel = require('../models/orderHistoryModel');

const getOrderHistory = async (req, res) => {
    try {
        const orders = await OrderHistoryModel.getAllHistory();
        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Lỗi lấy lịch sử hóa đơn:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await OrderHistoryModel.getOrderDetailById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy hóa đơn!" });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết hóa đơn:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
    }
};

module.exports = {
    getOrderHistory,
    getOrderDetail
};