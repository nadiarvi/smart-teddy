const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llm-controller');

router.get('/llm', llmController.getEmotion);

module.exports = router;