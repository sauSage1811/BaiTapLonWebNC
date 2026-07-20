function migrateProductCategorySchema(db, callback = () => {}) {
    const setNullDeleteRule = ["ON DELETE", "SET NULL"].join(" ");

    db.get(
        "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'products'",
        (err, row) => {
            if (err) {
                console.error("Loi kiem tra schema products:", err.message);
                callback(err);
                return;
            }

            if (!row || !row.sql.includes(setNullDeleteRule)) {
                db.run("CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)", callback);
                return;
            }

            db.exec(
                `
                PRAGMA foreign_keys = OFF;
                BEGIN TRANSACTION;
                DROP TABLE IF EXISTS __old_products;
                ALTER TABLE products RENAME TO __old_products;
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
                INSERT INTO products (id, name, price, category_id, image, status, created_at)
                SELECT id, name, price, category_id, image, status, created_at
                FROM __old_products;
                CREATE INDEX idx_products_category_id ON products(category_id);
                DROP TABLE __old_products;
                COMMIT;
                PRAGMA foreign_keys = ON;
                `,
                (migrateErr) => {
                    if (migrateErr) {
                        db.exec("ROLLBACK; PRAGMA foreign_keys = ON;", () => {});
                        console.error("Loi migrate schema products:", migrateErr.message);
                        callback(migrateErr);
                        return;
                    }

                    callback();
                }
            );
        }
    );
}

module.exports = migrateProductCategorySchema;
