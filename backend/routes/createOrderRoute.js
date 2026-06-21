const express = require('express');
const router = express.Router();
const createOrderController = require('../controllers/createOrderController');

router.post('/create', createOrderController);

module.exports = router;