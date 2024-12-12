require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const llmRoutes = require('./routes/llm-routes');
// const dataRoutes = require('./routes/data-routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('/api/llm', llmRoutes);
// app.use('/api/data/classify', dataRoutes);

