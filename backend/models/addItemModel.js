const db = require('../config/db');
db.run(`CREATE TABLE IF NOT EXISTS order_details (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, price REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE)`);
module.exports = {
    getPrice: (p_id) => new Promise((res, rej) => db.get('SELECT price FROM products WHERE id = ?', [p_id], (err, r) => err ? rej(err) : res(r))),
    addDetail: (o_id, p_id, q, p) => new Promise((res, rej) => db.run('INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [o_id, p_id, q, p], function(err) { err ? rej(err) : res(this); })),
    updateTotal: (o_id, am) => new Promise((res, rej) => db.run('UPDATE orders SET total_amount = total_amount + ? WHERE id = ?', [am, o_id], function(err) { err ? rej(err) : res(this); }))
};