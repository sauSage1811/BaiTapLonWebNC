function migrateCategorySchema(db, callback = () => {}) {
    db.all(
        `
        SELECT LOWER(TRIM(name)) AS normalized_name, COUNT(*) AS count
        FROM categories
        GROUP BY LOWER(TRIM(name))
        HAVING COUNT(*) > 1
        `,
        (err, duplicates) => {
            if (err) {
                console.error("Loi kiem tra trung ten danh muc:", err.message);
                callback(err);
                return;
            }

            if (duplicates.length > 0) {
                console.error("Khong the tao unique index danh muc vi co ten trung:", duplicates);
                callback();
                return;
            }

            db.run(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_unique ON categories(LOWER(TRIM(name)))",
                callback
            );
        }
    );
}

module.exports = migrateCategorySchema;
