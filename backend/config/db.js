const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../data/coffee.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Lỗi kết nối SQLite:", err.message);
    } else {
        console.log("Kết nối SQLite thành công");
    }
});

function migrateTablesTable() {
    db.all("PRAGMA table_info(tables)", (err, columns) => {
        if (err) {
            console.error("Lỗi kiểm tra schema bảng tables:", err.message);
            return;
        }

        if (!columns || columns.length === 0) {
            return;
        }

        const existingColumns = new Set(columns.map((column) => column.name));
        const columnMigrations = [
            ["capacity", "capacity TEXT NOT NULL DEFAULT '2-4'"],
            ["floor", "floor TEXT NOT NULL DEFAULT 'Tầng 1'"],
            ["area", "area TEXT NOT NULL DEFAULT 'Khu trong nhà'"],
            ["use_time", "use_time TEXT"]
        ];

        columnMigrations.forEach(([name, definition]) => {
            if (!existingColumns.has(name)) {
                db.run(`ALTER TABLE tables ADD COLUMN ${definition}`, (alterErr) => {
                    if (alterErr) {
                        console.error(`Lỗi thêm cột ${name} vào bảng tables:`, alterErr.message);
                    }
                });
            }
        });

        db.run("UPDATE tables SET status = 'using' WHERE status = 'occupied'");
        db.run("UPDATE tables SET status = 'maintenance' WHERE status = 'reserved'");
    });
}

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    migrateTablesTable();
});

module.exports = db;
