const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const openai = require('./src/openai');

app.get('/api/response', async (req, res) => {
  const prompt = req.query.prompt;
  const response = await openai.generateResponse(prompt);
  res.send(response);
});
