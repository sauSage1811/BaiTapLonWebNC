const addItemModel = require('../models/addItemModel');

async function addItem(req, res) {
    const { order_id, product_id, quantity } = req.body;
    const orderId = Number(order_id);
    const productId = Number(product_id);
    const itemQuantity = Number(quantity);

    if (
        !Number.isInteger(orderId) ||
        !Number.isInteger(productId) ||
        !Number.isInteger(itemQuantity) ||
        orderId <= 0 ||
        productId <= 0 ||
        itemQuantity <= 0
    ) {
        return res.status(400).json({ success: false, message: "Du lieu dau vao khong hop le hoac thieu" });
    }

    try {
        const order = await addItemModel.checkOrderPending(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Don hang khong ton tai hoac da thanh toan" });
        }

        const product = await addItemModel.getProductPrice(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "San pham khong ton tai" });
        }

        await addItemModel.addOrderItem(orderId, productId, itemQuantity, product.price);
        await addItemModel.refreshOrderTotal(orderId);

        res.json({ success: true, message: "Them mon va cap nhat tong tien thanh cong" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = addItem;
