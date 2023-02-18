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

app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files from public folder

app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/public/index.html'); // Serve index.html file
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

app.use(express.static('public', { 'extensions': ['html', 'js', 'css'] }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = {
  openai
};
