const addItemModel = require('../models/addItemModel');

async function addItem(req, res) {
    const { order_id, product_id, quantity } = req.body;
    if (!order_id || !product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ hoặc thiếu" });
    }

    try {
        const order = await addItemModel.checkOrderPending(order_id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại hoặc đã thanh toán" });
        }

        const product = await addItemModel.getProductPrice(product_id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại!" });
        }

        const totalItemPrice = product.price * quantity;
        await addItemModel.addOrderDetail(order_id, product_id, quantity, product.price);
        await addItemModel.updateTotalAmount(order_id, totalItemPrice);

        res.json({ success: true, message: "Thêm món và cập nhật tổng tiền thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = addItem;