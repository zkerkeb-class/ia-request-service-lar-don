const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat.controller');

//router.get(<path>,<controller>.<method>)
router.post('/', controller.createChat);

module.exports = router;
