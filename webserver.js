const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const { Configuration, OpenAIApi } = require("openai");

// OpenAI API configuration
const configuration = new Configuration({ 
  organization: process.env.OPENAI_ORG, 
  apiKey: process.env.OPENAI_KEY, 
});
const openai = new OpenAIApi(configuration);

// MongoDB configuration
const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.MONGO_DBNAME;

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(express.static('public')); 

app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/public/index.html'); 
}); 

app.post('/api/save-message', (req, res) => {
  const time = new Date().toString();
  const username = req.body.username;
  const message = req.body.message;
  const createdBy = "butler"
  const server = "web"
  const channel = "chat"
  const sender = req.body.username
  const receiver = "butler"


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
    const collection = db.collection('logs');

    collection.insertOne({ createdBy, server, channel, sender, receiver, message, time }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error saving message to database' });
        return;
      }

//      console.log(result);
      res.send({ success: true });
      client.close();
    });
  });
});

app.post('/api/response', async (req, res) => { 
  console.log('OpenAI API call received: /api/response');
  const prompt = req.body.message;
  console.log('Calling OpenAI API with message:', prompt);
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1000,
      temperature: .5,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: ""
    });
    //console.log('OpenAI API Response:', response);
    const result = response.data.choices[0].text.trim();
    res.send({ response: result });
  } catch (error) {
    console.error(`An error occurred while calling OpenAI API: ${error}`);
    console.error(error.response.data);
    res.status(500).send({ error: `An error occurred while calling OpenAI API: ${error}` });
  }
});

app.get('/api/personas', (req, res) => {
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection('personas');

    collection.find().toArray((err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error getting personas from database' });
        return;
      }

      res.send(results);
      client.close();
    });
  });
});

app.use(express.static('public', { 'extensions': ['html', 'js', 'css'] }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = {
  openai
};
