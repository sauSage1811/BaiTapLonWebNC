const createOrderModel = require('../models/createOrderModel');

async function createOrder(req, res) {
    const { table_id, user_id } = req.body;
    const tableId = Number(table_id);
    const userId = Number(req.user?.id || user_id);

    if (!Number.isInteger(tableId) || tableId <= 0) {
        return res.status(400).json({ success: false, message: "ID ban khong hop le" });
    }

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: "ID nhan vien khong hop le" });
    }

    try {
        const table = await createOrderModel.checkTableExists(tableId);
        if (!table) {
            return res.status(404).json({ success: false, message: "Khong tim thay ban de tao don" });
        }

        const user = await createOrderModel.checkUserExists(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Khong tim thay nhan vien tao don" });
        }

        const result = await createOrderModel.insertNewOrder(tableId, userId);
        await createOrderModel.updateTableStatus(tableId, 'using');

        res.status(201).json({
            success: true,
            message: "Tao don thanh cong va ban chuyen sang using",
            order_id: result.lastID
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = createOrder;
