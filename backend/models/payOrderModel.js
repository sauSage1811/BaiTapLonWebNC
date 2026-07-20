const db = require('../config/db');

function getOrderSummary(order_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT table_id, total_amount, status FROM orders WHERE id = ?', [order_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
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

function releaseTable(table_id) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE tables SET status = "empty" WHERE id = ?', [table_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

module.exports = {
    getOrderSummary,
    updateOrderStatusToPaid,
    releaseTable
};
