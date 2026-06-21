const productModel = require("../models/productModel");

function index(req, res) {
    productModel.getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            data: products
        });
    });
}

function show(req, res) {
    const id = req.params.id;

    productModel.getProductById(id, (err, product) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json({
            success: true,
            data: product
        });
    });
}

function store(req, res) {
    const { name, price, category_id, image, status } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            success: false,
            message: "Tên sản phẩm và giá không được để trống"
        });
    }

    productModel.createProduct(
        {
            name,
            price,
            category_id,
            image,
            status
        },
        (err, product) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Thêm sản phẩm thành công",
                data: product
            });
        }
    );
}

function update(req, res) {
    const id = req.params.id;
    const { name, price, category_id, image, status } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            success: false,
            message: "Tên sản phẩm và giá không được để trống"
        });
    }

    productModel.updateProduct(
        id,
        {
            name,
            price,
            category_id,
            image,
            status
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
                    message: "Không tìm thấy sản phẩm để sửa"
                });
            }

            res.json({
                success: true,
                message: "Cập nhật sản phẩm thành công",
                data: result
            });
        }
    );
}

function destroy(req, res) {
    const id = req.params.id;

    productModel.deleteProduct(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm để xóa"
            });
        }

        res.json({
            success: true,
            message: "Xóa sản phẩm thành công"
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