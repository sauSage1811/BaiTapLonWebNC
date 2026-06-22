const db = require('../config/db');

db.run(`
    CREATE TABLE IF NOT EXISTS order_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
`);

function checkOrderPending(order_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ? AND status = "pending"', [order_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getProductPrice(product_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT price FROM products WHERE id = ?', [product_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function addOrderDetail(order_id, product_id, quantity, price) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
        [order_id, product_id, quantity, price], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function updateTotalAmount(order_id, amount) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE orders SET total_amount = total_amount + ? WHERE id = ?', [amount, order_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

module.exports = {
    checkOrderPending,
    getProductPrice,
    addOrderDetail,
    updateTotalAmount
};