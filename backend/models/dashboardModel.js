const db = require("../config/db");

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows || []);
        });
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);
    return nextDate;
}

function getRevenueWindow(range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (range === "30d") {
        return {
            start: addDays(today, -29),
            end: today
        };
    }

    if (range === "month") {
        return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };
    }

    return {
        start: addDays(today, -6),
        end: today
    };
}

function buildDateSeries(start, end) {
    const dates = [];
    let cursor = new Date(start);

    while (cursor <= end) {
        dates.push(formatDate(cursor));
        cursor = addDays(cursor, 1);
    }

    return dates;
}

async function getOverview() {
    const today = formatDate(new Date());

    const [revenueRow, ordersRow, tablesRow, productsRow] = await Promise.all([
        get(
            `
            SELECT COALESCE(SUM(total_amount), 0) AS todayRevenue
            FROM orders
            WHERE status = 'paid'
              AND paid_at IS NOT NULL
              AND date(paid_at, 'localtime') = ?
            `,
            [today]
        ),
        get(
            `
            SELECT COUNT(*) AS todayOrders
            FROM orders
            WHERE date(created_at, 'localtime') = ?
            `,
            [today]
        ),
        get(
            `
            SELECT
                COALESCE(SUM(CASE WHEN status = 'using' THEN 1 ELSE 0 END), 0) AS occupiedTables,
                COUNT(*) AS totalTables
            FROM tables
            `
        ),
        get(
            `
            SELECT COUNT(*) AS activeProducts
            FROM products
            WHERE status = 'active'
            `
        )
    ]);

    return {
        todayRevenue: Number(revenueRow?.todayRevenue || 0),
        todayOrders: Number(ordersRow?.todayOrders || 0),
        occupiedTables: Number(tablesRow?.occupiedTables || 0),
        totalTables: Number(tablesRow?.totalTables || 0),
        activeProducts: Number(productsRow?.activeProducts || 0)
    };
}

async function getRevenue(range = "7d") {
    const { start, end } = getRevenueWindow(range);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    const rows = await all(
        `
        SELECT date(paid_at, 'localtime') AS date, COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE status = 'paid'
          AND paid_at IS NOT NULL
          AND date(paid_at, 'localtime') BETWEEN ? AND ?
        GROUP BY date(paid_at, 'localtime')
        ORDER BY date ASC
        `,
        [startDate, endDate]
    );

    const revenueByDate = new Map(rows.map((row) => [row.date, Number(row.revenue || 0)]));

    return buildDateSeries(start, end).map((date) => ({
        date,
        revenue: revenueByDate.get(date) || 0
    }));
}

async function getTopProducts(limit = 5) {
    return all(
        `
        SELECT
            p.id,
            p.name,
            p.image,
            c.name AS categoryName,
            SUM(oi.quantity) AS quantitySold,
            SUM(oi.subtotal) AS totalRevenue
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        INNER JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE o.status = 'paid'
        GROUP BY p.id, p.name, p.image, c.name
        ORDER BY quantitySold DESC, totalRevenue DESC
        LIMIT ?
        `,
        [limit]
    );
}

async function getRecentOrders(limit = 8) {
    return all(
        `
        SELECT
            o.id,
            o.table_id AS tableId,
            t.name AS tableName,
            u.full_name AS staffName,
            o.total_amount AS totalAmount,
            o.status,
            o.created_at AS createdAt,
            o.paid_at AS paidAt
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.id DESC
        LIMIT ?
        `,
        [limit]
    );
}

module.exports = {
    getOverview,
    getRevenue,
    getTopProducts,
    getRecentOrders
};
