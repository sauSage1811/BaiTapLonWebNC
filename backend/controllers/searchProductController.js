const searchProductModel = require('../models/searchProductModel');

async function searchProduct(req, res) {
    const searchName = req.query.name || '';
    try {
        const data = await searchProductModel.searchProductsByName(searchName);
        res.json({ success: true, count: data.length, data: data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = searchProduct;