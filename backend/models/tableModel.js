const db = require("../config/db");

const VALID_TABLE_STATUSES = ['empty', 'using', 'maintenance'];

const TABLE_SELECT = `
    SELECT
        id,
        name,
        name AS tableNumber,
        capacity,
        floor,
        area,
        status,
        use_time AS useTime,
        created_at
    FROM tables
`;

function normalizeTableData(data) {
    return {
        name: data.name,
        capacity: data.capacity || '2-4',
        floor: data.floor || 'Tầng 1',
        area: data.area || 'Khu trong nhà',
        status: data.status || 'empty',
        useTime: data.useTime || data.use_time || null
    };
}

function validateStatus(status) {
    return VALID_TABLE_STATUSES.includes(status);
}

function createValidationError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function getAllTables(callback) {
    const sql = `
        ${TABLE_SELECT}
        ORDER BY id ASC
    `;

    db.all(sql, [], callback);
}

function getTableById(id, callback) {
    const sql = `
        ${TABLE_SELECT}
        WHERE id = ?
    `;

    db.get(sql, [id], callback);
}

function createTable(data, callback) {
    const table = normalizeTableData(data);

    if (!validateStatus(table.status)) {
        return callback(createValidationError('Trạng thái không hợp lệ. Phải là: empty, using, maintenance'));
    }

    const sql = `
        INSERT INTO tables (name, capacity, floor, area, status, use_time)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        table.name,
        table.capacity,
        table.floor,
        table.area,
        table.status,
        table.useTime
    ];

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }

        getTableById(this.lastID, callback);
    });
}

function updateTable(id, data, callback) {
    const table = normalizeTableData(data);

    if (!validateStatus(table.status)) {
        return callback(createValidationError('Trạng thái không hợp lệ. Phải là: empty, using, maintenance'));
    }

    const sql = `
        UPDATE tables
        SET name = ?,
            capacity = ?,
            floor = ?,
            area = ?,
            status = ?,
            use_time = ?
        WHERE id = ?
    `;

    const params = [
        table.name,
        table.capacity,
        table.floor,
        table.area,
        table.status,
        table.useTime,
        id
    ];

    db.run(sql, params, function(err) {
        if (err) {
            return callback(err);
        }

        getTableById(id, callback);
    });
}

function updateTableStatus(id, status, callback) {
    if (!validateStatus(status)) {
        return callback(createValidationError('Trạng thái không hợp lệ. Phải là: empty, using, maintenance'));
    }

    const sql = `
        UPDATE tables SET status = ? WHERE id = ?
    `;

    db.run(sql, [status, id], function(err) {
        if (err) {
            return callback(err);
        }

        getTableById(id, callback);
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
    VALID_TABLE_STATUSES,
    getAllTables,
    getTableById,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable
};
