const db = require('../config/db');

const OrderHistoryModel = {
    // 1. Lấy toàn bộ danh sách lịch sử hóa đơn
    getAllHistory: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT o.id, o.table_id, t.name AS table_name, o.total_amount, o.status, o.created_at
                FROM orders o
                LEFT JOIN tables t ON o.table_id = t.id
                ORDER BY o.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    // 2. Lấy chi tiết 1 hóa đơn kèm danh sách món
    getOrderDetailById: (orderId) => {
        return new Promise((resolve, reject) => {
            const orderSql = `
                SELECT o.id, o.table_id, t.name AS table_name, o.total_amount, o.status, o.created_at
                FROM orders o
                LEFT JOIN tables t ON o.table_id = t.id
                WHERE o.id = ?
            `;
            
            db.get(orderSql, [orderId], (err, order) => {
                if (err) return reject(err);
                if (!order) return resolve(null);

                const itemsSql = `
                    SELECT oi.id, oi.product_id, p.name AS product_name, oi.quantity, oi.price
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                `;

                db.all(itemsSql, [orderId], (err, items) => {
                    if (err) return reject(err);
                    resolve({
                        ...order,
                        items: items || []
                    });
                });
            });
        });
    }
};

module.exports = OrderHistoryModel;