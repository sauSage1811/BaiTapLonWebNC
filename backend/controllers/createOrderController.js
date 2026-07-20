const createOrderModel = require('../models/createOrderModel');

async function createOrder(req, res) {
    const { table_id, user_id } = req.body;
    
    const tableId = table_id; // Giữ nguyên dạng chuỗi ("T01") để không bị lỗi NaN
    const userId = req.user?.id || user_id;

    if (!tableId) {
        return res.status(400).json({ success: false, message: "Mã bàn không được để trống" });
    }

    try {
        const table = await createOrderModel.checkTableExists(tableId);
        if (!table) {
            return res.status(404).json({ success: false, message: "Khong tim thay ban de tao don" });
        }

        // Chỉ kiểm tra nhân viên khi có truyền userId lên
        if (userId) {
            const user = await createOrderModel.checkUserExists(Number(userId));
            if (!user) {
                return res.status(404).json({ success: false, message: "Khong tim thay nhan vien tao don" });
            }
        }

        const result = await createOrderModel.insertNewOrder(tableId, userId ? Number(userId) : null);
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