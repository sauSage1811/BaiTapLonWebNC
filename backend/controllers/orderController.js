const orderModel = require("../models/orderModel");
const { toPositiveInteger } = require("../utils/validation");

function sendError(res, error) {
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Loi server"
    });
}

function validateId(value, name) {
    const id = toPositiveInteger(value);
    if (!id) {
        const error = new Error(`${name} khong hop le`);
        error.statusCode = 400;
        throw error;
    }

    return id;
}

async function index(req, res) {
    try {
        const tableId = req.query.table_id ? validateId(req.query.table_id, "table_id") : null;
        const orders = await orderModel.getOrders(tableId);
        return res.status(200).json({
            success: true,
            message: "Lay danh sach don hang thanh cong",
            data: orders
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function history(req, res) {
    try {
        const orders = await orderModel.getOrderHistory();
        return res.status(200).json({
            success: true,
            message: "Lay lich su don hang thanh cong",
            data: orders
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function show(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const order = await orderModel.getOrderDetail(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay don hang"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lay chi tiet don hang thanh cong",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function store(req, res) {
    try {
        const tableId = validateId(req.body.table_id, "table_id");
        const userId = req.user.id;
        const order = await orderModel.createOrder(tableId, userId);

        return res.status(201).json({
            success: true,
            message: "Tao don thanh cong va ban chuyen sang using",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function addItem(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const productId = validateId(req.body.product_id, "product_id");
        const quantity = validateId(req.body.quantity, "quantity");
        const order = await orderModel.addItem(orderId, productId, quantity);

        return res.status(200).json({
            success: true,
            message: "Them mon va cap nhat tong tien thanh cong",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function updateItem(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const itemId = validateId(req.params.itemId, "ID mon");
        const quantity = validateId(req.body.quantity, "quantity");
        const order = await orderModel.updateItem(orderId, itemId, quantity);

        return res.status(200).json({
            success: true,
            message: "Cap nhat mon trong don thanh cong",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function deleteItem(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const itemId = validateId(req.params.itemId, "ID mon");
        const order = await orderModel.deleteItem(orderId, itemId);

        return res.status(200).json({
            success: true,
            message: "Xoa mon trong don thanh cong",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function pay(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const result = await orderModel.payOrder(orderId);

        return res.status(200).json({
            success: true,
            message: "Thanh toan thanh cong",
            data: result
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function cancel(req, res) {
    try {
        const orderId = validateId(req.params.id, "ID don hang");
        const order = await orderModel.cancelOrder(orderId);

        return res.status(200).json({
            success: true,
            message: "Huy don hang thanh cong",
            data: order
        });
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = {
    index,
    history,
    show,
    store,
    addItem,
    updateItem,
    deleteItem,
    pay,
    cancel
};
