const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;
const { Log, getPersonaData } = require('./src/mongo.js');

const openaiAPI = require('./src/openai.js');
const { Configuration, OpenAIApi } = require("openai");
const { response } = require('express');

// MongoDB configuration
const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.MONGO_DBNAME;

// OpenAI API configuration
const configuration = new Configuration({ 
  organization: process.env.OPENAI_ORG, 
  apiKey: process.env.OPENAI_KEY, 
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(express.static('public')); 

// Serve the index.html file
app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/public/index.html'); 
}); 

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

// Save Message to MongoDB
app.post('/api/save-message', (req, res) => {
  const time = new Date().toString();
  const username = req.body.username;
  let message = req.body.message;
  let createdBy = req.body.persona;
  let sender = req.body.username || "anonymous"; 
  let receiver = req.body.persona;
  const server = "web";
  const channel = "chat";

  // Log the message to MongoDB for user
  if (username === username) {
    try {
      const userLog = new Log({
        createdBy: createdBy || "testcreatedBy",
        server: "web",
        channel: "chat",
        sender: sender,
        receiver: receiver || "testreceiver",
        message: req.body.message,
        time: new Date().toString(),
      });
      userLog.save().then(() => {
      }).catch(err => {
        console.error(err);
      });
    } catch (error) {
      console.error(`An error occurred while calling MongoDB: ${error}`);
      console.error(error.stack);
      res.status(500).send({ error: `An error occurred while calling MongoDB: ${error}` });
    }
  }
});
  
// Call OpenAI API and save response to MongoDB
app.post('/api/response', async (req, res) => { 
  const prompt = req.body.message;
  const username = req.body.username;
  const persona = req.body.persona;
  try {
    const response = await openaiAPI.callopenai(prompt, username, persona);
    const result = response;
    res.send({ response: result }); // Send the response back to the client.

    // Log the response to MongoDB
    const time = new Date().toString();
    const createdBy = persona;
    const sender = persona;
    const receiver = username;
    const server = "web";
    const channel = "chat";

    try {
      const botLog = new Log({
        createdBy: createdBy,
        server: "web",
        channel: "chat",
        sender: sender,
        receiver: receiver || "testreceiver",
        message: result,
        time: time,
      });
      botLog.save().then(() => {
        }).catch(err => {
        console.error(err);
      });        
    } catch (error) {
      console.error(`An error occurred while calling MongoDB: ${error}`);
      console.error(error.stack);
    }
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


// Get chat history from MongoDB
app.post('/api/chat-history', (req, res) => {
  const username = req.body.username;
  const selectedPersona = req.body.selectedPersona;
//  console.log(`webserver.js - Line 145 - username: ${username}, selectedPersona: ${selectedPersona}`);

  // Retrieve chat history from MongoDB
  Log.find(
    {
      $or: [
        { sender: username, receiver: selectedPersona },
        { sender: selectedPersona, receiver: username },
      ],
    },
    (err, messages) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error retrieving chat history' });
        return;
      }

//      console.log(`webserver.js - Line 162 - messages: ${JSON.stringify(messages)}`);
      res.send(messages);
    }
  );
});

app.use(express.static('public', { 'extensions': ['html', 'js', 'css'] }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});