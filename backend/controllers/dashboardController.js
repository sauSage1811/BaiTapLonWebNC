const dashboardModel = require("../models/dashboardModel");
const { toPositiveInteger } = require("../utils/validation");

const VALID_REVENUE_RANGES = new Set(["7d", "30d", "month"]);

function sendError(res, error) {
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Loi server"
    });
}

async function overview(req, res) {
    try {
        const data = await dashboardModel.getOverview();

        return res.status(200).json({
            success: true,
            message: "Lay tong quan dashboard thanh cong",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function revenue(req, res) {
    try {
        const range = VALID_REVENUE_RANGES.has(req.query.range) ? req.query.range : "7d";
        const data = await dashboardModel.getRevenue(range);

        return res.status(200).json({
            success: true,
            message: "Lay doanh thu dashboard thanh cong",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function topProducts(req, res) {
    try {
        const limit = toPositiveInteger(req.query.limit) || 5;
        const safeLimit = Math.min(limit, 20);
        const data = await dashboardModel.getTopProducts(safeLimit);

        return res.status(200).json({
            success: true,
            message: "Lay san pham ban chay thanh cong",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function recentOrders(req, res) {
    try {
        const limit = toPositiveInteger(req.query.limit) || 8;
        const safeLimit = Math.min(limit, 20);
        const data = await dashboardModel.getRecentOrders(safeLimit);

        return res.status(200).json({
            success: true,
            message: "Lay don hang gan day thanh cong",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = {
    overview,
    revenue,
    topProducts,
    recentOrders
};
