const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../data/coffee.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Loi ket noi SQLite:", err.message);
    } else {
        console.log("Ket noi SQLite thanh cong");
    }
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
});

module.exports = db;
