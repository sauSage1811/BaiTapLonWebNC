const express = require('express');
const router = express.Router();
const addItemController = require('../controllers/addItemController');

router.post('/add-item', addItemController);

module.exports = router;