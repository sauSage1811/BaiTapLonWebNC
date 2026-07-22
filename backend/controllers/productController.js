const productModel = require("../models/productModel");
const {
    isOneOf,
    normalizeRequiredString,
    toNonNegativeNumber,
    toPositiveInteger
} = require("../utils/validation");

const PRODUCT_STATUSES = ["active", "inactive"];

function validateProductPayload(body) {
    const name = normalizeRequiredString(body.name);
    const price = toNonNegativeNumber(body.price);
    const categoryId = toPositiveInteger(body.category_id);
    const status = body.status || "active";

    if (!name) {
        return { error: "Ten san pham khong duoc de trong" };
    }

    if (price === null) {
        return { error: "Gia san pham khong hop le" };
    }

    if (!categoryId) {
        return { error: "Danh muc san pham khong hop le" };
    }

    if (!isOneOf(status, PRODUCT_STATUSES)) {
        return { error: "Trang thai san pham khong hop le" };
    }

    return {
        data: {
            name,
            price,
            category_id: categoryId,
            image: typeof body.image === "string" ? body.image.trim() || null : null,
            status
        }
    };
}

function sendSqlError(res, err) {
    const statusCode = err.code === "SQLITE_CONSTRAINT" ? 409 : 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message
    });
}

function index(req, res) {
    productModel.getAllProducts((err, products) => {
        if (err) {
            return sendSqlError(res, err);
        }

        res.status(200).json({
            success: true,
            message: "Lay danh sach san pham thanh cong",
            data: products
        });
    });
}

function show(req, res) {
    const id = toPositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID san pham khong hop le"
        });
    }

    productModel.getProductById(id, (err, product) => {
        if (err) {
            return sendSqlError(res, err);
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay san pham"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lay san pham thanh cong",
            data: product
        });
    });
}

function store(req, res) {
    const validation = validateProductPayload(req.body);

    if (validation.error) {
        return res.status(400).json({
            success: false,
            message: validation.error
        });
    }

    productModel.createProduct(validation.data, (err, product) => {
        if (err) {
            return sendSqlError(res, err);
        }

        res.status(201).json({
            success: true,
            message: "Them san pham thanh cong",
            data: product
        });
    });
}

function update(req, res) {
    const id = toPositiveInteger(req.params.id);
    const validation = validateProductPayload(req.body);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID san pham khong hop le"
        });
    }

    if (validation.error) {
        return res.status(400).json({
            success: false,
            message: validation.error
        });
    }

    productModel.updateProduct(id, validation.data, (err, result) => {
        if (err) {
            return sendSqlError(res, err);
        }

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay san pham de sua"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cap nhat san pham thanh cong",
            data: result
        });
    });
}

function destroy(req, res) {
    const id = toPositiveInteger(req.params.id);

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID san pham khong hop le"
        });
    }

    productModel.deleteProduct(id, (err, result) => {
        if (err) {
            return sendSqlError(res, err);
        }

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay san pham de xoa"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xoa san pham thanh cong",
            data: null
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
