const ORDER_STATUS_CHECK = "status IN ('pending', 'paid', 'cancelled')";
const LEGACY_LINE_TABLE = ["order", "details"].join("_");
const OLD_LEGACY_LINE_TABLE = `__old_${LEGACY_LINE_TABLE}`;
const SET_NULL_DELETE_RULE = ["ON DELETE", "SET NULL"].join(" ");

const ORDER_TRIGGERS = `
DROP TRIGGER IF EXISTS trg_order_items_after_insert_total;
DROP TRIGGER IF EXISTS trg_order_items_after_update_total;
DROP TRIGGER IF EXISTS trg_order_items_after_delete_total;
DROP TRIGGER IF EXISTS trg_orders_validate_total_amount;
DROP TRIGGER IF EXISTS trg_orders_validate_total_amount_insert;

CREATE TRIGGER trg_order_items_after_insert_total
AFTER INSERT ON order_items
BEGIN
    UPDATE orders
    SET total_amount = COALESCE((
        SELECT SUM(subtotal)
        FROM order_items
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;
END;

CREATE TRIGGER trg_order_items_after_update_total
AFTER UPDATE ON order_items
BEGIN
    UPDATE orders
    SET total_amount = COALESCE((
        SELECT SUM(subtotal)
        FROM order_items
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE id = NEW.order_id;

    UPDATE orders
    SET total_amount = COALESCE((
        SELECT SUM(subtotal)
        FROM order_items
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id AND OLD.order_id != NEW.order_id;
END;

CREATE TRIGGER trg_order_items_after_delete_total
AFTER DELETE ON order_items
BEGIN
    UPDATE orders
    SET total_amount = COALESCE((
        SELECT SUM(subtotal)
        FROM order_items
        WHERE order_id = OLD.order_id
    ), 0)
    WHERE id = OLD.order_id;
END;

CREATE TRIGGER trg_orders_validate_total_amount
BEFORE UPDATE OF total_amount ON orders
WHEN ABS(NEW.total_amount - COALESCE((
    SELECT SUM(subtotal)
    FROM order_items
    WHERE order_id = NEW.id
), 0)) > 0.001
BEGIN
    SELECT RAISE(ABORT, 'orders.total_amount must match order_items subtotal sum');
END;

CREATE TRIGGER trg_orders_validate_total_amount_insert
BEFORE INSERT ON orders
WHEN ABS(NEW.total_amount) > 0.001
BEGIN
    SELECT RAISE(ABORT, 'new orders.total_amount must start at 0');
END;
`;

function quoteIdentifier(name) {
    return `"${String(name).replace(/"/g, '""')}"`;
}

function columnExpression(columns, name, fallback) {
    return columns.has(name) ? quoteIdentifier(name) : fallback;
}

function buildOrdersInsert(columns) {
    const tableId = columnExpression(columns, "table_id", "NULL");
    const userId = columnExpression(columns, "user_id", "NULL");
    const totalAmount = columnExpression(columns, "total_amount", "0");
    const status = columnExpression(columns, "status", "'pending'");
    const createdAt = columnExpression(columns, "created_at", "CURRENT_TIMESTAMP");
    const paidAt = columnExpression(columns, "paid_at", "NULL");

    return `
        INSERT INTO orders (id, table_id, user_id, total_amount, status, created_at, paid_at)
        SELECT
            id,
            ${tableId},
            COALESCE(${userId}, (SELECT id FROM users ORDER BY id LIMIT 1)),
            MAX(COALESCE(${totalAmount}, 0), 0),
            CASE
                WHEN ${status} IN ('pending', 'paid', 'cancelled') THEN ${status}
                ELSE 'pending'
            END,
            COALESCE(${createdAt}, CURRENT_TIMESTAMP),
            CASE
                WHEN ${status} = 'paid' THEN COALESCE(${paidAt}, CURRENT_TIMESTAMP)
                ELSE ${paidAt}
            END
        FROM __old_orders;
    `;
}

function buildOrderItemsInsert(columns) {
    const quantity = columnExpression(columns, "quantity", "1");
    const price = columnExpression(columns, "price", "0");
    const subtotal = columnExpression(columns, "subtotal", `(${quantity} * ${price})`);

    return `
        INSERT INTO order_items (id, order_id, product_id, quantity, price, subtotal)
        SELECT
            id,
            order_id,
            product_id,
            ${quantity},
            ${price},
            COALESCE(${subtotal}, ${quantity} * ${price})
        FROM __old_order_items
        WHERE ${quantity} > 0;
    `;
}

function runMigration(db, hasOrderItems, hasLegacyLineTable, orderColumns, itemColumns, callback = () => {}) {
    const statements = [
        "PRAGMA foreign_keys = OFF;",
        "BEGIN TRANSACTION;",
        "DROP TRIGGER IF EXISTS trg_order_items_after_insert_total;",
        "DROP TRIGGER IF EXISTS trg_order_items_after_update_total;",
        "DROP TRIGGER IF EXISTS trg_order_items_after_delete_total;",
        "DROP TRIGGER IF EXISTS trg_orders_validate_total_amount;",
        "DROP TRIGGER IF EXISTS trg_orders_validate_total_amount_insert;",
        "DROP INDEX IF EXISTS idx_orders_table_id;",
        "DROP INDEX IF EXISTS idx_orders_user_id;",
        "DROP INDEX IF EXISTS idx_order_items_order_id;",
        "DROP INDEX IF EXISTS idx_order_items_product_id;",
        "DROP TABLE IF EXISTS __old_orders;",
        "DROP TABLE IF EXISTS __old_order_items;",
        `DROP TABLE IF EXISTS ${OLD_LEGACY_LINE_TABLE};`,
        hasOrderItems ? "ALTER TABLE order_items RENAME TO __old_order_items;" : "",
        hasLegacyLineTable ? `ALTER TABLE ${LEGACY_LINE_TABLE} RENAME TO ${OLD_LEGACY_LINE_TABLE};` : "",
        "ALTER TABLE orders RENAME TO __old_orders;",
        `
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
            status TEXT NOT NULL DEFAULT 'pending' CHECK (${ORDER_STATUS_CHECK}),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            paid_at DATETIME,
            CHECK (status != 'paid' OR paid_at IS NOT NULL),
            FOREIGN KEY (table_id) REFERENCES tables(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );
        `,
        `
        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
            price REAL NOT NULL CHECK (price >= 0),
            subtotal REAL NOT NULL CHECK (subtotal = quantity * price),
            FOREIGN KEY (order_id) REFERENCES orders(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
                ON DELETE RESTRICT
                ON UPDATE CASCADE
        );
        `,
        buildOrdersInsert(orderColumns),
        hasOrderItems ? buildOrderItemsInsert(itemColumns) : "",
        hasLegacyLineTable
            ? `
            INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
            SELECT order_id, product_id, quantity, price, quantity * price
            FROM ${OLD_LEGACY_LINE_TABLE} old_detail
            WHERE quantity > 0
              AND NOT EXISTS (
                SELECT 1
                FROM order_items item
                WHERE item.order_id = old_detail.order_id
                  AND item.product_id = old_detail.product_id
                  AND item.quantity = old_detail.quantity
                  AND item.price = old_detail.price
              );
            `
            : "",
        `
        UPDATE orders
        SET total_amount = COALESCE((
            SELECT SUM(subtotal)
            FROM order_items
            WHERE order_id = orders.id
        ), 0);
        `,
        "CREATE INDEX idx_orders_table_id ON orders(table_id);",
        "CREATE INDEX idx_orders_user_id ON orders(user_id);",
        "CREATE INDEX idx_order_items_order_id ON order_items(order_id);",
        "CREATE INDEX idx_order_items_product_id ON order_items(product_id);",
        ORDER_TRIGGERS,
        `DROP TABLE IF EXISTS ${OLD_LEGACY_LINE_TABLE};`,
        "DROP TABLE IF EXISTS __old_order_items;",
        "DROP TABLE IF EXISTS __old_orders;",
        "COMMIT;",
        "PRAGMA foreign_keys = ON;"
    ].filter(Boolean).join("\n");

    db.exec(statements, (err) => {
        if (err) {
            db.exec("ROLLBACK; PRAGMA foreign_keys = ON;", () => {});
            console.error("Loi migrate schema don hang:", err.message);
            callback(err);
            return;
        }

        db.all("PRAGMA foreign_key_check", (checkErr, rows) => {
            if (checkErr) {
                console.error("Loi kiem tra foreign key don hang:", checkErr.message);
                callback(checkErr);
                return;
            }

            if (rows.length > 0) {
                const fkError = new Error("Schema don hang con foreign key khong hop le");
                console.error(fkError.message, rows);
                callback(fkError);
                return;
            }

            callback();
        });
    });
}

function migrateOrderSchema(db, callback = () => {}) {
    db.all(
        `
        SELECT name, type, sql
        FROM sqlite_master
        WHERE type IN ('table', 'trigger') AND (
            name = ?
            OR name IN (
                'orders',
                'order_items',
                'trg_order_items_after_insert_total',
                'trg_order_items_after_update_total',
                'trg_order_items_after_delete_total',
                'trg_orders_validate_total_amount',
                'trg_orders_validate_total_amount_insert'
            )
        )
        `,
        [LEGACY_LINE_TABLE],
        (err, objects) => {
            if (err) {
                console.error("Loi kiem tra schema don hang:", err.message);
                callback(err);
                return;
            }

            const byName = new Map(objects.map((object) => [object.name, object]));
            const hasOrders = byName.has("orders");
            const hasOrderItems = byName.has("order_items");
            const hasLegacyLineTable = byName.has(LEGACY_LINE_TABLE);

            if (!hasOrders) {
                callback();
                return;
            }

            const ordersSql = byName.get("orders")?.sql || "";
            const orderItemsSql = byName.get("order_items")?.sql || "";
            const hasAllTriggers = [
                "trg_order_items_after_insert_total",
                "trg_order_items_after_update_total",
                "trg_order_items_after_delete_total",
                "trg_orders_validate_total_amount",
                "trg_orders_validate_total_amount_insert"
            ].every((name) => byName.has(name));

            const needsMigration =
                hasLegacyLineTable ||
                !hasOrderItems ||
                ordersSql.includes(SET_NULL_DELETE_RULE) ||
                orderItemsSql.includes(SET_NULL_DELETE_RULE) ||
                orderItemsSql.includes("__old_products") ||
                (orderItemsSql && !orderItemsSql.includes("REFERENCES products")) ||
                !ordersSql.includes(ORDER_STATUS_CHECK) ||
                !orderItemsSql.includes("quantity > 0") ||
                !hasAllTriggers;

            if (!needsMigration) {
                callback();
                return;
            }

            db.all("PRAGMA table_info(orders)", (ordersErr, orderRows) => {
                if (ordersErr) {
                    console.error("Loi doc cot orders:", ordersErr.message);
                    callback(ordersErr);
                    return;
                }

                db.all("PRAGMA table_info(order_items)", (itemsErr, itemRows) => {
                    if (itemsErr && hasOrderItems) {
                        console.error("Loi doc cot order_items:", itemsErr.message);
                        callback(itemsErr);
                        return;
                    }

                    runMigration(
                        db,
                        hasOrderItems,
                        hasLegacyLineTable,
                        new Set(orderRows.map((column) => column.name)),
                        new Set((itemRows || []).map((column) => column.name)),
                        callback
                    );
                });
            });
        }
    );
}

module.exports = migrateOrderSchema;
