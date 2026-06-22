const db = require("../config/db");

function getAllCategories(callback) {
    const sql = `
        SELECT id, name, description, created_at
        FROM categories
        ORDER BY id DESC
    `;

    db.all(sql, [], callback);
}

function getCategoryById(id, callback) {
    const sql = `
        SELECT id, name, description, created_at
        FROM categories
        WHERE id = ?
    `;

    db.get(sql, [id], callback);
}

function createCategory(data, callback) {
    const sql = `
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `;

    db.run(
        sql,
        [data.name, data.description || null],
        function (err) {
            callback(err, {
                id: this?.lastID,
                ...data
            });
        }
    );
}

function updateCategory(id, data, callback) {
    const sql = `
        UPDATE categories
        SET name = ?, description = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [data.name, data.description || null, id],
        function (err) {
            callback(err, {
                id,
                ...data,
                changes: this?.changes
            });
        }
    );
}

function deleteCategory(id, callback) {
    const sql = `
        DELETE FROM categories
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {
        callback(err, {
            id,
            changes: this?.changes
        });
    });
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
