const tableModel = require("../models/tableModel");

function buildTablePayload(body, fallback = {}) {
    return {
        name: body.name ?? fallback.name,
        capacity: body.capacity ?? fallback.capacity,
        floor: body.floor ?? fallback.floor,
        area: body.area ?? fallback.area,
        status: body.status ?? fallback.status ?? 'empty',
        useTime: body.useTime ?? body.use_time ?? fallback.useTime ?? null
    };
}

function index(req, res) {
    tableModel.getAllTables((err, tables) => {
        if (err) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: tables
        });
    });
}

function show(req, res) {
    const id = req.params.id;

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bàn"
            });
        }

        res.json({
            success: true,
            data: table
        });
    });
}

function store(req, res) {
    const payload = buildTablePayload(req.body);

    if (!payload.name) {
        return res.status(400).json({
            success: false,
            message: "Tên bàn không được để trống"
        });
    }

    tableModel.createTable(payload, (err, result) => {
        if (err) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Tạo bàn thành công",
            data: result
        });
    });
}

function update(req, res) {
    const id = req.params.id;

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bàn"
            });
        }

        const payload = buildTablePayload(req.body, table);

        if (!payload.name) {
            return res.status(400).json({
                success: false,
                message: "Tên bàn không được để trống"
            });
        }

        tableModel.updateTable(id, payload, (err, result) => {
            if (err) {
                return res.status(err.statusCode || 500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Cập nhật bàn thành công",
                data: result
            });
        });
    });
}

function updateStatus(req, res) {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Trạng thái không được để trống"
        });
    }

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bàn"
            });
        }

        tableModel.updateTableStatus(id, status, (err, result) => {
            if (err) {
                return res.status(err.statusCode || 500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Cập nhật trạng thái bàn thành công",
                data: result
            });
        });
    });
}

function destroy(req, res) {
    const id = req.params.id;

    tableModel.getTableById(id, (err, table) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bàn"
            });
        }

        tableModel.deleteTable(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
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
