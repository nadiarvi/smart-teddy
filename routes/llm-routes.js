const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llm-controller');
const { getEmotion } = require('../controllers/llm-controller');

router.get('/llm/getEmotion', getEmotion);

module.exports = router;