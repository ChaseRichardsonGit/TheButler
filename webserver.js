const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const openai = require('openai');
const callopenai = require('./src/openai.js');
const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = 'mongodb+srv://anarche:p4ssw0rd@discordlogs.epfawzd.mongodb.net/testing?retryWrites=true&w=majority';
const dbName = 'testing';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/save-message', (req, res) => {
  const timestamp = new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const username = req.body.username;
  const message = req.body.message;

  if (!username || !message) {
    res.status(400).send({ error: 'Username or message not provided' });
    return;
  }

  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection('website');

    collection.insertOne({ timestamp, username, message }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error saving message to database' });
        return;
      }

      res.send({ success: true });
      client.close();
    });
  });
});

app.get('/api/response', async (req, res) => {
  const prompt = req.query.prompt;
  const response = await openai.prompt(prompt);
  res.send({ response });
});

app.use(express.static('public', { 'extensions': ['html', 'js', 'css'] }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
