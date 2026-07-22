const db = require("../config/db");

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }

            resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows || []);
        });
    });
}

async function withTransaction(callback) {
    await run("BEGIN TRANSACTION");

    try {
        const result = await callback();
        await run("COMMIT");
        return result;
    } catch (error) {
        await run("ROLLBACK").catch(() => {});
        throw error;
    }
}

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function getOrders(tableId = null) {
    if (tableId) {
        return all(
            `
            SELECT *
            FROM orders
            WHERE table_id = ?
            ORDER BY id DESC
            `,
            [tableId]
        );
    }

    return all(
        `
        SELECT *
        FROM orders
        ORDER BY id DESC
        `
    );
}

async function getOrderHistory() {
    return all(
        `
        SELECT o.id, o.table_id, t.name AS table_name, o.total_amount, o.status, o.created_at, o.paid_at
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        ORDER BY o.id DESC
        `
    );
}

async function getOrderDetail(orderId) {
    const order = await get(
        `
        SELECT o.id, o.table_id, t.name AS table_name, o.total_amount, o.status, o.created_at, o.paid_at
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        WHERE o.id = ?
        `,
        [orderId]
    );

    if (!order) {
        return null;
    }

    const items = await all(
        `
        SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal, p.name AS product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
        `,
        [orderId]
    );

    return {
        ...order,
        items
    };
}

async function createOrder(tableId, userId) {
    return withTransaction(async () => {
        const table = await get("SELECT id FROM tables WHERE id = ?", [tableId]);
        if (!table) {
            throw createHttpError(404, "Khong tim thay ban de tao don");
        }

        const result = await run(
            'INSERT INTO orders (table_id, user_id, total_amount, status) VALUES (?, ?, 0, "pending")',
            [tableId, userId]
        );

        await run('UPDATE tables SET status = "using" WHERE id = ?', [tableId]);

        return getOrderDetail(result.lastID);
    });
}

async function refreshOrderTotal(orderId) {
    return run(
        `
        UPDATE orders
        SET total_amount = COALESCE((
            SELECT SUM(subtotal)
            FROM order_items
            WHERE order_id = ?
        ), 0)
        WHERE id = ?
        `,
        [orderId, orderId]
    );
}

async function addItem(orderId, productId, quantity) {
    return withTransaction(async () => {
        const order = await get("SELECT id, status FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            throw createHttpError(404, "Don hang khong ton tai");
        }

        if (order.status !== "pending") {
            throw createHttpError(409, "Chi co the them mon vao don dang cho thanh toan");
        }

        const product = await get(
            'SELECT id, price FROM products WHERE id = ? AND status = "active"',
            [productId]
        );
        if (!product) {
            throw createHttpError(409, "San pham khong ton tai hoac dang inactive");
        }

        const price = Number(product.price);
        if (!Number.isFinite(price) || price < 0) {
            throw createHttpError(409, "Gia san pham khong hop le");
        }

        const existingItem = await get(
            "SELECT id, quantity FROM order_items WHERE order_id = ? AND product_id = ?",
            [orderId, productId]
        );

        if (existingItem) {
            const nextQuantity = Number(existingItem.quantity) + quantity;
            await run(
                "UPDATE order_items SET quantity = ?, subtotal = ? WHERE id = ?",
                [nextQuantity, nextQuantity * price, existingItem.id]
            );
        } else {
            await run(
                "INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)",
                [orderId, productId, quantity, price, quantity * price]
            );
        }

        await refreshOrderTotal(orderId);
        return getOrderDetail(orderId);
    });
}

async function updateItem(orderId, itemId, quantity) {
    return withTransaction(async () => {
        const order = await get("SELECT id, status FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            throw createHttpError(404, "Don hang khong ton tai");
        }

        if (order.status !== "pending") {
            throw createHttpError(409, "Chi co the cap nhat mon trong don pending");
        }

        const item = await get("SELECT id, price FROM order_items WHERE id = ? AND order_id = ?", [itemId, orderId]);
        if (!item) {
            throw createHttpError(404, "Khong tim thay mon trong don");
        }

        await run(
            "UPDATE order_items SET quantity = ?, subtotal = ? WHERE id = ?",
            [quantity, quantity * Number(item.price), itemId]
        );
        await refreshOrderTotal(orderId);
        return getOrderDetail(orderId);
    });
}

async function deleteItem(orderId, itemId) {
    return withTransaction(async () => {
        const order = await get("SELECT id, status FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            throw createHttpError(404, "Don hang khong ton tai");
        }

        if (order.status !== "pending") {
            throw createHttpError(409, "Chi co the xoa mon trong don pending");
        }

        const result = await run("DELETE FROM order_items WHERE id = ? AND order_id = ?", [itemId, orderId]);
        if (result.changes === 0) {
            throw createHttpError(404, "Khong tim thay mon trong don");
        }

        await refreshOrderTotal(orderId);
        return getOrderDetail(orderId);
    });
}

async function payOrder(orderId) {
    return withTransaction(async () => {
        const order = await get("SELECT id, table_id, total_amount, status FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            throw createHttpError(404, "Khong tim thay don hang");
        }

        if (order.status === "paid") {
            throw createHttpError(409, "Don hang nay da duoc thanh toan");
        }

        if (order.status === "cancelled") {
            throw createHttpError(409, "Don hang da huy khong the thanh toan");
        }

        await run('UPDATE orders SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ?', [orderId]);
        await run('UPDATE tables SET status = "empty" WHERE id = ?', [order.table_id]);

        return {
            id: order.id,
            table_id: order.table_id,
            total_amount: order.total_amount
        };
    });
}

async function cancelOrder(orderId) {
    return withTransaction(async () => {
        const order = await get("SELECT id, table_id, status FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            throw createHttpError(404, "Khong tim thay don hang");
        }

        if (order.status === "paid") {
            throw createHttpError(409, "Don da thanh toan khong duoc xoa hoac huy");
        }

        if (order.status === "cancelled") {
            throw createHttpError(409, "Don hang da bi huy truoc do");
        }

        await run('UPDATE orders SET status = "cancelled" WHERE id = ?', [orderId]);
        await run('UPDATE tables SET status = "empty" WHERE id = ?', [order.table_id]);

        return getOrderDetail(orderId);
    });
}

module.exports = {
    getOrders,
    getOrderHistory,
    getOrderDetail,
    createOrder,
    addItem,
    updateItem,
    deleteItem,
    payOrder,
    cancelOrder
};
