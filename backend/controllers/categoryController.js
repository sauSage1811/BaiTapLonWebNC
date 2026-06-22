const categoryModel = require("../models/categoryModel");

function index(req, res) {
    categoryModel.getAllCategories((err, categories) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: categories
        });
    });
}

function show(req, res) {
    const id = req.params.id;

    categoryModel.getCategoryById(id, (err, category) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        res.json({
            success: true,
            data: category
        });
    });
}

function store(req, res) {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Tên danh mục không được để trống"
        });
    }

    categoryModel.createCategory(
        {
            name,
            description
        },
        (err, category) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Thêm danh mục thành công",
                data: category
            });
        }
    );
}

function update(req, res) {
    const id = req.params.id;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Tên danh mục không được để trống"
        });
    }

    categoryModel.updateCategory(
        id,
        {
            name,
            description
        },
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }

            res.json({
                success: true,
                message: "Cập nhật danh mục thành công",
                data: result
            });
        }
    );
}

function destroy(req, res) {
    const id = req.params.id;

    categoryModel.deleteCategory(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        res.json({
            success: true,
            message: "Xóa danh mục thành công"
        });
    });
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
};
