const db = require('../config/db');

function getOrderSummary(order_id) {
    return new Promise((resolve, reject) => {
        // 1. Lấy thông tin chung của đơn hàng + Tên bàn
        const orderSql = `
            SELECT o.id, o.table_id, t.name AS table_name, o.total_amount, o.status 
            FROM orders o
            LEFT JOIN tables t ON o.table_id = t.id
            WHERE o.id = ?
        `;

        db.get(orderSql, [order_id], (err, order) => {
            if (err) return reject(err);
            if (!order) return resolve(null);

            // 2. Lấy danh sách các món ăn thuộc đơn hàng này
            const itemsSql = `
                SELECT oi.id, oi.quantity, oi.price, p.name AS product_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;

            db.all(itemsSql, [order_id], (err, items) => {
                if (err) return reject(err);

                resolve({
                    ...order,
                    items: items || []
                });
            });
        });
    });
}

function updateOrderStatusToPaid(order_id) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE orders SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ?', [order_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function occupyTable(table_id) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE tables SET status = "using" WHERE id = ?', [table_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function markOrderPaidAndOccupyTable(order_id, table_id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN IMMEDIATE TRANSACTION", (beginErr) => {
                if (beginErr) {
                    return reject(beginErr);
                }

                db.run(
                    'UPDATE orders SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
                    [order_id],
                    function(orderErr) {
                        if (orderErr) {
                            return db.run("ROLLBACK", () => reject(orderErr));
                        }

                        if (this.changes === 0) {
                            return db.run("ROLLBACK", () => reject(new Error("Don hang khong o trang thai cho thanh toan")));
                        }

                        db.run(
                            'UPDATE tables SET status = "using" WHERE id = ?',
                            [table_id],
                            function(tableErr) {
                                if (tableErr) {
                                    return db.run("ROLLBACK", () => reject(tableErr));
                                }

                                db.run("COMMIT", (commitErr) => {
                                    if (commitErr) {
                                        return db.run("ROLLBACK", () => reject(commitErr));
                                    }

                                    resolve({ changes: this.changes });
                                });
                            }
                        );
                    }
                );
            });
        });
    });
}

module.exports = {
    getOrderSummary,
    updateOrderStatusToPaid,
    occupyTable,
    markOrderPaidAndOccupyTable
};
