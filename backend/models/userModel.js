const db = require("../config/db");

function findUserByUsername(username, callback) {
    const sql = `
        SELECT * FROM users
        WHERE username = ?
        LIMIT 1
    `;

    db.get(sql, [username], callback);
}

function findUserById(id, callback) {
    const sql = `
        SELECT id, full_name, username, role, status, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.get(sql, [id], callback);
}

module.exports = {
    findUserByUsername,
    findUserById
};