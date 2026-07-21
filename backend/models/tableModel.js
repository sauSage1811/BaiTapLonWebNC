const db = require("../config/db");

const VALID_TABLE_STATUSES = ['empty', 'using', 'maintenance'];

const ACTIVE_ORDER_SELECT = `
    SELECT o.id
    FROM orders o
    WHERE o.table_id = t.id AND o.status = 'pending'
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT 1
`;

const EFFECTIVE_STATUS_SELECT = `
    CASE
        WHEN t.status = 'maintenance' THEN 'maintenance'
        WHEN t.status = 'using' THEN 'using'
        ELSE 'empty'
    END
`;

const TABLE_SELECT = `
    SELECT
        t.id,
        t.name,
        t.name AS tableNumber,
        t.capacity,
        t.floor,
        t.area,
        t.status AS raw_status,
        ${EFFECTIVE_STATUS_SELECT} AS status,
        (${ACTIVE_ORDER_SELECT}) AS active_order_id,
        t.use_time AS useTime,
        t.created_at,
        (
            SELECT o.id
            FROM orders o
            WHERE o.table_id = t.id AND o.status = 'paid'
            ORDER BY o.paid_at DESC, o.id DESC
            LIMIT 1
        ) AS latest_paid_order_id,
        (
            SELECT o.paid_at
            FROM orders o
            WHERE o.table_id = t.id AND o.status = 'paid'
            ORDER BY o.paid_at DESC, o.id DESC
            LIMIT 1
        ) AS latest_paid_at,
        (
            SELECT o.total_amount
            FROM orders o
            WHERE o.table_id = t.id AND o.status = 'paid'
            ORDER BY o.paid_at DESC, o.id DESC
            LIMIT 1
        ) AS latest_paid_total
    FROM tables t
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
        ORDER BY t.id ASC
    `;

    db.all(sql, [], callback);
}

function getAvailableTables(callback) {
    const sql = `
        ${TABLE_SELECT}
        WHERE ${EFFECTIVE_STATUS_SELECT} = 'empty'
        ORDER BY t.id ASC
    `;

    db.all(sql, [], callback);
}

function getTableById(id, callback) {
    const sql = `
        ${TABLE_SELECT}
        WHERE t.id = ?
    `;

    db.get(sql, [id], callback);
}

function getLatestPaidOrderByTableId(tableId, callback) {
    const sql = `
        SELECT
            o.id,
            o.table_id,
            o.total_amount,
            o.status,
            o.created_at,
            o.paid_at,
            t.name AS table_name,
            u.full_name AS cashier_name
        FROM orders o
        LEFT JOIN tables t ON t.id = o.table_id
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.table_id = ? AND o.status = 'paid'
        ORDER BY o.paid_at DESC, o.id DESC
        LIMIT 1
    `;

    db.get(sql, [tableId], (err, order) => {
        if (err) {
            return callback(err);
        }

        if (!order) {
            return callback(null, null);
        }

        db.all(
            `
            SELECT
                oi.id,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.price,
                oi.subtotal
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
            `,
            [order.id],
            (itemsErr, items) => {
                if (itemsErr) {
                    return callback(itemsErr);
                }

                callback(null, { ...order, items });
            }
        );
    });
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
    getAvailableTables,
    getTableById,
    getLatestPaidOrderByTableId,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable
};
