const db = require('../config/db');

function checkTableExists(table_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tables WHERE id = ?', [table_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function checkUserExists(user_id) {
    return new Promise((resolve, reject) => {
        if (!user_id) return resolve(true); 
        db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function insertNewOrder(table_id, user_id) {
    return new Promise((resolve, reject) => {
        const finalUserId = user_id || null; 
        db.run(
            'INSERT INTO orders (table_id, user_id, total_amount, status) VALUES (?, ?, 0.00, "pending")',
            [table_id, finalUserId],
            function(err) {
                if (err) reject(err);
                else resolve(this); 
            }
        );
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
    checkUserExists,
    insertNewOrder,
    updateTableStatus
};