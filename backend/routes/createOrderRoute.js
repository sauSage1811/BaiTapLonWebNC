const router = require('express').Router();
router.post('/create', require('../controllers/createOrderController'));
module.exports = router;