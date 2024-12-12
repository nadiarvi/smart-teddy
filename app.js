require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const llmRoutes = require('./routes/llm-routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('api/llm/getEmotion', llmRoutes);