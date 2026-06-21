const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "coffee.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

const db = new sqlite3.Database(dbPath);

const schema = fs.readFileSync(schemaPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error("Lỗi tạo bảng:", err.message);
            return;
        }

        console.log("Tạo bảng thành công");

        db.exec(seed, (err) => {
            if (err) {
                console.error("Lỗi thêm dữ liệu mẫu:", err.message);
                return;
            }

            console.log("Thêm dữ liệu mẫu thành công");
            console.log("Database đã tạo tại:", dbPath);
        });
    });
});

db.close();