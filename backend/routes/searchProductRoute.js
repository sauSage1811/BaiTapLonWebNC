const express = require('express');
const router = express.Router();
const searchProductController = require('../controllers/searchProductController');

router.get('/products', searchProductController);

module.exports = router;