const db = require('../config/db');

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

function addOrderItem(order_id, product_id, quantity, price) {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem món ăn này đã được thêm vào đơn hàng chưa
        db.get(
            'SELECT id, quantity FROM order_items WHERE order_id = ? AND product_id = ?',
            [order_id, product_id],
            (err, row) => {
                if (err) return reject(err);

                if (row) {
                    // Nếu có rồi: Cộng dồn số lượng và cập nhật subtotal mới
                    const newQuantity = row.quantity + quantity;
                    const newSubtotal = newQuantity * price;

                    db.run(
                        'UPDATE order_items SET quantity = ?, subtotal = ? WHERE id = ?',
                        [newQuantity, newSubtotal, row.id],
                        function(err) {
                            if (err) reject(err);
                            else resolve(this);
                        }
                    );
                } else {
                    // Nếu chưa có: Tạo dòng mới như bình thường
                    const subtotal = quantity * price;
                    db.run(
                        'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
                        [order_id, product_id, quantity, price, subtotal],
                        function(err) {
                            if (err) reject(err);
                            else resolve(this);
                        }
                    );
                }
            }
        );
    });
}

function refreshOrderTotal(order_id) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE orders
             SET total_amount = COALESCE((
                SELECT SUM(subtotal)
                FROM order_items
                WHERE order_id = ?
             ), 0)
             WHERE id = ?`,
            [order_id, order_id],
            function(err) {
                if (err) reject(err);
                else resolve(this);
            }
        );
    });
}

function getOrderItems(order_id) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [order_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    checkOrderPending,
    getProductPrice,
    addOrderItem,
    refreshOrderTotal,
    getOrderItems
};