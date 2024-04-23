const express = require('express');
const router = express.Router();

const riotRouter = require('./riot.route');

router.use('/riot', riotRouter);

module.exports = router;
