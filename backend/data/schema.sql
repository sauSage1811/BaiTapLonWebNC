PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    status TEXT NOT NULL DEFAULT 'active',
    security_question TEXT,
    security_answer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_categories_name_unique ON categories(LOWER(TRIM(name)));

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER NOT NULL,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity TEXT NOT NULL DEFAULT '2-4',
    floor TEXT NOT NULL DEFAULT 'Tầng 1',
    area TEXT NOT NULL DEFAULT 'Khu trong nhà',
    status TEXT NOT NULL DEFAULT 'empty',
    use_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
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

CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

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
