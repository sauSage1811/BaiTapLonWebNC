const createOrderModel = require('../models/createOrderModel');
module.exports = async (req, res) => {
    const { table_id, user_id } = req.body;
    try {
        const result = await createOrderModel.insertOrder(table_id, user_id);
        await createOrderModel.updateTableStatus(table_id, 'occupied');
        res.status(201).json({ success: true, message: "Tạo đơn thành công & Bàn chuyển sang 'occupied'!", order_id: result.lastID });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};