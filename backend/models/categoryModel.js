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

function getCategoryByName(name, excludeId, callback) {
    const params = [name];
    let excludeClause = "";

    if (excludeId) {
        excludeClause = "AND id != ?";
        params.push(excludeId);
    }

    const sql = `
        SELECT id, name, description, created_at
        FROM categories
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        ${excludeClause}
        LIMIT 1
    `;

    db.get(sql, params, callback);
}

function countProductsByCategory(id, callback) {
    const sql = `
        SELECT COUNT(*) AS count
        FROM products
        WHERE category_id = ?
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
        [data.name.trim(), data.description?.trim() || null],
        function (err) {
            callback(err, {
                id: this?.lastID,
                name: data.name.trim(),
                description: data.description?.trim() || null
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
        [data.name.trim(), data.description?.trim() || null, id],
        function (err) {
            callback(err, {
                id,
                name: data.name.trim(),
                description: data.description?.trim() || null,
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
    getCategoryByName,
    countProductsByCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
