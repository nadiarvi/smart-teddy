const express = require('express');
const router = express.Router();
const dataController = require('../controllers/llm-controller');
const { classify, sampleClassifier } = require('../controllers/data-controller');

router.post('/classify', classify);

router.post('/sample', sampleClassifier);

module.exports = router;