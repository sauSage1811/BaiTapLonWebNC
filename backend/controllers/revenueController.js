const revenueModel = require("../models/revenueModel");

async function getRevenue(req, res) {
    try {
        const result = await revenueModel.calculateTotalRevenue();
        res.status(200).json({
            success: true,
            message: "Lay doanh thu thanh cong",
            data: {
                total_revenue: result.total_revenue || 0
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = getRevenue;
