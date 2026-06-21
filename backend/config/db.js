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

db.run("PRAGMA foreign_keys = ON");

module.exports = db;