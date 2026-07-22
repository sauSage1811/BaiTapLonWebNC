require("dotenv").config();

const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const migrateCategorySchema = require("./migrateCategorySchema");
const migrateOrderSchema = require("./migrateOrderSchema");
const migrateProductCategorySchema = require("./migrateProductCategorySchema");

const dbPath = path.join(__dirname, "coffee.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Khong the ket noi SQLite:", err.message);
        process.exit(1);
    }
});

function migrateTablesTable(callback) {
    db.all("PRAGMA table_info(tables)", (err, columns) => {
        if (err) {
            console.error("Loi kiem tra schema bang tables:", err.message);
            callback(err);
            return;
        }

        if (!columns || columns.length === 0) {
            callback();
            return;
        }

        const existingColumns = new Set(columns.map((column) => column.name));
        const columnMigrations = [
            ["capacity", "capacity TEXT NOT NULL DEFAULT '2-4'"],
            ["floor", "floor TEXT NOT NULL DEFAULT 'Tang 1'"],
            ["area", "area TEXT NOT NULL DEFAULT 'Khu trong nha'"],
            ["use_time", "use_time TEXT"]
        ];

        const missingMigrations = columnMigrations.filter(([name]) => !existingColumns.has(name));
        const statements = missingMigrations
            .map(([, definition]) => `ALTER TABLE tables ADD COLUMN ${definition};`)
            .join("\n");

        db.exec(
            `
            ${statements}
            UPDATE tables SET status = 'using' WHERE status = 'occupied';
            UPDATE tables SET status = 'maintenance' WHERE status = 'reserved';
            `,
            callback
        );
    });
}

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    migrateTablesTable((tableErr) => {
        if (tableErr) {
            db.close();
            process.exit(1);
        }

        migrateCategorySchema(db, (categoryErr) => {
            if (categoryErr) {
                db.close();
                process.exit(1);
            }

            migrateProductCategorySchema(db, (productErr) => {
                if (productErr) {
                    db.close();
                    process.exit(1);
                }

                migrateOrderSchema(db, (orderErr) => {
                    if (orderErr) {
                        db.close();
                        process.exit(1);
                    }

                    console.log("Database migrations completed");
                    db.close();
                });
            });
        });
    });
});
