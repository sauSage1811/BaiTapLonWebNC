const createOrderModel = require('../models/createOrderModel');

module.exports = async (req, res) => {
    const { table_id, user_id } = req.body;
    try {
        const result = await createOrderModel(table_id, user_id);
        res.status(201).json({ success: true, message: "Tạo đơn hàng thành công!", order_id: result.lastID });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};