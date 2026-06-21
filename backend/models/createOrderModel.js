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

module.exports = (table_id, user_id) => {
    return new Promise((res, rej) => {
        db.run('INSERT INTO orders (table_id, user_id, total_amount, status) VALUES (?, ?, 0.00, "pending")', [table_id, user_id], function(err) {
            err ? rej(err) : res(this);
        });
    });
};