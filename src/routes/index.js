const express = require('express');
const router = express.Router();

const riotRouter = require('./riot.route');
const chatRouter = require('./chat.route');

router.use('/riot', riotRouter);
router.use('/chat', chatRouter);

module.exports = router;
