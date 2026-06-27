const router = require('express').Router();
router.get('/products', require('../controllers/searchProductController'));
module.exports = router;