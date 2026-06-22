const db = require('../config/db');

db.run(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        table_id INTEGER NOT NULL, 
        user_id INTEGER, 
        total_amount REAL DEFAULT 0.0, 
        status TEXT DEFAULT 'pending', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

function checkTableExists(table_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tables WHERE id = ?', [table_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function insertNewOrder(table_id, user_id) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO orders (table_id, user_id, total_amount, status) VALUES (?, ?, 0.00, "pending")', 
        [table_id, user_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function updateTableStatus(table_id, status) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE tables SET status = ? WHERE id = ?', [status, table_id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

module.exports = {
    checkTableExists,
    insertNewOrder,
    updateTableStatus
};