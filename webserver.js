const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;
const { Log } = require('./src/mongo.js');

const openaiAPI = require('./src/openai.js');
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

// Serve the index.html file
app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/public/index.html'); 
}); 

// Save message to MongoDB
app.post('/api/save-message', (req, res) => {
  const time = new Date().toString();
  const username = req.body.username;
  const message = req.body.message;
  const createdBy = req.body.persona;
  const server = "web";
  const channel = "chat";
  const sender = req.body.username; 

// Log the message to MongoDB for user
  
const messageType = req.body.messageType;
let receiver;
if (messageType === "sent") {
  receiver = req.body.recipient;
} else if (messageType === "received") {
  receiver = req.body.username;
} else {
  // handle invalid message types
}

// Log the message to MongoDB for user
try {
  const log = new Log({
    createdBy: createdBy,
    server: "web",
    channel: "chat",
    sender: sender,
    receiver: receiver,
    message: req.body.message,
    time: new Date().toString(),
  });
    log.save().then(() => {
        console.log(`Message logged to MongoDB: ${sender}: ${req.body.message}\n`);
    }).catch(err => {
      console.error(err);
  });
    
  } catch (error) {
    console.error(`An error occurred while calling MongoDB: ${error}`);
    console.error(error.stack);
    res.status(500).send({ error: `An error occurred while calling MongoDB: ${error}` });
  }
});

// Call OpenAI API
app.post('/api/response', async (req, res) => { 
  const prompt = req.body.message;
  const username = req.body.username;
  const persona = req.body.persona;
//  console.log('Calling OpenAI API with message, username, and persona:', prompt, username, persona);
  try {
    const response = await openaiAPI.callopenai(prompt, username, persona);
    const result = response;
    res.send({ response: result });
  } catch (error) {
    console.error(`An error occurred while calling OpenAI API: ${error}`);
    console.error(error.response.data);
    res.status(500).send({ error: `An error occurred while calling OpenAI API: ${error}` });
  }
});

// Get personas from MongoDB
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