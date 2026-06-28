const createOrderModel = require('../models/createOrderModel');

async function createOrder(req, res) {
    const { table_id, user_id } = req.body;
    if (!table_id) {
        return res.status(400).json({ success: false, message: "ID bàn không được để trống" });
    }

    try {
        const table = await createOrderModel.checkTableExists(table_id);
        if (!table) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bàn để tạo đơn" });
        }

        const result = await createOrderModel.insertNewOrder(table_id, user_id);
        await createOrderModel.updateTableStatus(table_id, 'using');

        res.status(201).json({ 
            success: true, 
            message: "Tạo đơn thành công & Bàn chuyển sang 'using'!", 
            order_id: result.lastID 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = createOrder;
