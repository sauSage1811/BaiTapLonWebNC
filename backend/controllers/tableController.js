const tableModel = require("../models/tableModel");
const { normalizeRequiredString, toPositiveInteger } = require("../utils/validation");

function buildTablePayload(body, fallback = {}) {
    return {
        name: normalizeRequiredString(body.name ?? fallback.name),
        capacity: normalizeRequiredString(body.capacity ?? fallback.capacity) || "2-4",
        floor: normalizeRequiredString(body.floor ?? fallback.floor) || "Tang 1",
        area: normalizeRequiredString(body.area ?? fallback.area) || "Khu trong nha",
        status: body.status ?? fallback.status ?? "empty",
        useTime: normalizeRequiredString(body.useTime ?? body.use_time ?? fallback.useTime ?? "") || null
    };
}

function sendError(res, err) {
    const statusCode = err.code === "SQLITE_CONSTRAINT" ? 409 : err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message
    });
}

function index(req, res) {
    tableModel.getAllTables((err, tables) => {
        if (err) {
            return sendError(res, err);
        }

        res.status(200).json({
            success: true,
            message: "Lay danh sach ban thanh cong",
            data: tables
        });
    });
}

function show(req, res) {
    const id = toPositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID ban khong hop le"
        });
    }

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return sendError(res, err);
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay ban"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lay ban thanh cong",
            data: table
        });
    });
}

function store(req, res) {
    const payload = buildTablePayload(req.body);

    if (!payload.name) {
        return res.status(400).json({
            success: false,
            message: "Ten ban khong duoc de trong"
        });
    }

    tableModel.createTable(payload, (err, result) => {
        if (err) {
            return sendError(res, err);
        }

        res.status(201).json({
            success: true,
            message: "Tao ban thanh cong",
            data: result
        });
    });
}

function update(req, res) {
    const id = toPositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID ban khong hop le"
        });
    }

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return sendError(res, err);
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay ban"
            });
        }

        const payload = buildTablePayload(req.body, table);

        if (!payload.name) {
            return res.status(400).json({
                success: false,
                message: "Ten ban khong duoc de trong"
            });
        }

        tableModel.updateTable(id, payload, (err, result) => {
            if (err) {
                return sendError(res, err);
            }

            res.status(200).json({
                success: true,
                message: "Cap nhat ban thanh cong",
                data: result
            });
        });
    });
}

function updateStatus(req, res) {
    const id = toPositiveInteger(req.params.id);
    const { status } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID ban khong hop le"
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Trang thai khong duoc de trong"
        });
    }

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return sendError(res, err);
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay ban"
            });
        }

        tableModel.updateTableStatus(id, status, (err, result) => {
            if (err) {
                return sendError(res, err);
            }

            res.status(200).json({
                success: true,
                message: "Cap nhat trang thai ban thanh cong",
                data: result
            });
        });
    });
}

function destroy(req, res) {
    const id = toPositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID ban khong hop le"
        });
    }

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return sendError(res, err);
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay ban"
            });
        }

        tableModel.deleteTable(id, (err, result) => {
            if (err) {
                return sendError(res, err);
            }

            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        });
    });
}

module.exports = {
    index,
    show,
    store,
    update,
    updateStatus,
    destroy
};
