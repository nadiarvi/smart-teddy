const express = require('express');
const router = express.Router();
// const dataController = require('../controllers/llm-controller');
const { classify } = require('../controllers/data-controller');

router.post('/classify', classify);

module.exports = router;