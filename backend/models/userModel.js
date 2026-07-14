const db = require("../config/db");

function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM users
            WHERE username = ?
            LIMIT 1
        `;

        db.get(sql, [username], (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

function findUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, full_name, username, role, status, created_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `;

        db.get(sql, [id], (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

function createUser(data) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (full_name, username, password, role, status, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.full_name,
            data.username,
            data.password,
            data.role || "staff",
            data.status || "active",
            data.security_question,
            data.security_answer
        ];

        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }

            resolve({ id: this.lastID });
        });
    });
}

function updatePassword(username, newPassword) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE users
            SET password = ?
            WHERE username = ?
        `;

        db.run(sql, [newPassword, username], function(err) {
            if (err) {
                return reject(err);
            }

            resolve({ changes: this.changes });
        });
    });
}

function updateSecurityAnswer(username, newSecurityAnswer) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE users
            SET security_answer = ?
            WHERE username = ?
        `;

        db.run(sql, [newSecurityAnswer, username], function(err) {
            if (err) {
                return reject(err);
            }

            resolve({ changes: this.changes });
        });
    });
}

module.exports = {
    findUserByUsername,
    findUserById,
    createUser,
    updatePassword,
    updateSecurityAnswer
};