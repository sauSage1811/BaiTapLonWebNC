const db = require("../config/db");

function getAllProducts(callback) {
    const sql = `
        SELECT 
            products.id,
            products.name,
            products.price,
            products.category_id,
            products.image,
            products.status,
            products.created_at,
            categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        ORDER BY products.id DESC
    `;

    db.all(sql, [], callback);
}

function getProductById(id, callback) {
    const sql = `
        SELECT 
            products.id,
            products.name,
            products.price,
            products.category_id,
            products.image,
            products.status,
            products.created_at,
            categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = ?
    `;

    db.get(sql, [id], callback);
}

function createProduct(data, callback) {
    const sql = `
        INSERT INTO products (name, price, category_id, image, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            data.name,
            data.price,
            data.category_id,
            data.image || null,
            data.status || "active"
        ],
        function (err) {
            callback(err, {
                id: this?.lastID,
                ...data
            });
        }
    );
}

function updateProduct(id, data, callback) {
    const sql = `
        UPDATE products
        SET name = ?, price = ?, category_id = ?, image = ?, status = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            data.name,
            data.price,
            data.category_id,
            data.image || null,
            data.status || "active",
            id
        ],
        function (err) {
            callback(err, {
                id,
                ...data,
                changes: this?.changes
            });
        }
    );
}

function deleteProduct(id, callback) {
    const sql = `
        DELETE FROM products
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
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};