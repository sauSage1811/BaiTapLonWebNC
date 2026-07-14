const db = require('../config/db');

function searchProductsByName(name) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products WHERE name LIKE ?', [`%${name}%`], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    searchProductsByName
};