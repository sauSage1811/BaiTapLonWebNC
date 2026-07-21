function migrateStoreSettingsSchema(db) {
    const sql = `
        CREATE TABLE IF NOT EXISTS store_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            store_name TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            address TEXT NOT NULL DEFAULT '',
            contact_email TEXT NOT NULL DEFAULT '',
            opening_time TEXT NOT NULL DEFAULT '',
            closing_time TEXT NOT NULL DEFAULT '',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO store_settings (
            id,
            store_name,
            phone,
            address,
            contact_email,
            opening_time,
            closing_time
        )
        VALUES (1, '', '', '', '', '', '');
    `;

    db.exec(sql, (err) => {
        if (err) {
            console.error("Loi migrate thong tin cua hang:", err.message);
        }
    });
}

module.exports = migrateStoreSettingsSchema;
