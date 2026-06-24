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

function createUser(data, callback) {
    const sql = `
        INSERT INTO users (full_name, username, password, role, status, security_question, security_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        data.full_name,
        data.username,
        data.password,
        data.role || 'staff',
        data.status || 'active',
        data.security_question,
        data.security_answer
    ];

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID });
    });
}

function updatePassword(username, newPassword, callback) {
    const sql = `
        UPDATE users
        SET password = ?
        WHERE username = ?
    `;

    db.run(sql, [newPassword, username], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { changes: this.changes });
    });
}

module.exports = {
    findUserByUsername,
    findUserById,
    createUser,
    updatePassword
};