const db = require('../config/db');

function calculateTotalRevenue() {
    return new Promise((resolve, reject) => {
        db.get('SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status = "paid"', [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    calculateTotalRevenue
};