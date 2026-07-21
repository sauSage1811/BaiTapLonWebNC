const db = require("../config/db");

const STORE_SETTINGS_ID = 1;

function getStoreSettings() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, store_name, phone, address, contact_email, opening_time, closing_time, updated_at
            FROM store_settings
            WHERE id = ?
            LIMIT 1
        `;

        db.get(sql, [STORE_SETTINGS_ID], (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);
        });
    });
}

function upsertStoreSettings(data) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO store_settings (
                id,
                store_name,
                phone,
                address,
                contact_email,
                opening_time,
                closing_time,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                store_name = excluded.store_name,
                phone = excluded.phone,
                address = excluded.address,
                contact_email = excluded.contact_email,
                opening_time = excluded.opening_time,
                closing_time = excluded.closing_time,
                updated_at = CURRENT_TIMESTAMP
        `;

        const params = [
            STORE_SETTINGS_ID,
            data.store_name,
            data.phone,
            data.address,
            data.contact_email,
            data.opening_time,
            data.closing_time
        ];

        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }

            resolve({ changes: this.changes });
        });
    });
}

module.exports = {
    getStoreSettings,
    upsertStoreSettings
};
