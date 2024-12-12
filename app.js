require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ip = require('ip');

const llmRoutes = require('./routes/llm-routes');
const dataRoutes = require('./routes/data-routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`Server is running on ${ip.address()}:${PORT}`);
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('/api/llm', llmRoutes);
app.use('/api/data', dataRoutes);

module.exports = app;