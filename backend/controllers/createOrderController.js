const createOrderModel = require('../models/createOrderModel');

async function createOrder(req, res) {
    const { table_id, user_id } = req.body;

    const tableId = table_id;
    const userId = req.user?.id || user_id;

    if (!tableId) {
        return res.status(400).json({ success: false, message: "Ma ban khong duoc de trong" });
    }

    try {
        const table = await createOrderModel.checkTableExists(tableId);
        if (!table) {
            return res.status(404).json({ success: false, message: "Khong tim thay ban de tao don" });
        }

        if (table.status !== 'empty') {
            return res.status(400).json({
                success: false,
                message: table.status === 'maintenance'
                    ? "Ban dang bao tri, khong the tao don"
                    : "Ban dang su dung, khong the tao don moi"
            });
        }

        const activeOrder = await createOrderModel.hasActiveOrderForTable(tableId);
        if (activeOrder) {
            return res.status(200).json({
                success: true,
                message: "Ban nay dang co don dang mo, tiep tuc goi mon",
                order_id: activeOrder.id
            });
        }

        if (userId) {
            const user = await createOrderModel.checkUserExists(Number(userId));
            if (!user) {
                return res.status(404).json({ success: false, message: "Khong tim thay nhan vien tao don" });
            }
        }

        const result = await createOrderModel.insertNewOrder(tableId, userId ? Number(userId) : null);

        res.status(201).json({
            success: true,
            message: "Tao don thanh cong",
            order_id: result.lastID
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = createOrder;
