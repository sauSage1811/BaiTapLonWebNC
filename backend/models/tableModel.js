const db = require("../config/db");

function getAllTables(callback) {
    const sql = `
        SELECT * FROM tables
        ORDER BY id ASC
    `;

    db.all(sql, [], callback);
}

function getTableById(id, callback) {
    const sql = `
        SELECT * FROM tables WHERE id = ?
    `;

    db.get(sql, [id], callback);
}

function createTable(name, callback) {
    const sql = `
        INSERT INTO tables (name, status)
        VALUES (?, 'empty')
    `;

    db.run(sql, [name], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID, name, status: 'empty' });
    });
}

function updateTable(id, name, callback) {
    const sql = `
        UPDATE tables SET name = ? WHERE id = ?
    `;

    db.run(sql, [name, id], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id, name });
    });
}

function updateTableStatus(id, status, callback) {
    const validStatuses = ['empty', 'occupied', 'reserved'];
    
    if (!validStatuses.includes(status)) {
        return callback(new Error('Trạng thái không hợp lệ. Phải là: empty, occupied, reserved'));
    }

    const sql = `
        UPDATE tables SET status = ? WHERE id = ?
    `;

    db.run(sql, [status, id], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id, status });
    });
}

function deleteTable(id, callback) {
    const sql = `
        DELETE FROM tables WHERE id = ?
    `;

    db.run(sql, [id], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { message: 'Xóa bàn thành công' });
    });
}

module.exports = {
    getAllTables,
    getTableById,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable
};
