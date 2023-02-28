const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;
const { Log, getPersonaData, updatePersonaData } = require('./src/mongo.js');
const { ObjectId } = require('mongodb');

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

// Save message to MongoDB async function
async function saveMessageToDB(createdBy, sender, receiver, message) {
  const time = new Date().toString();
  const server = "web";
  const channel = "chat";

  try {
    const userLog = new Log({
      createdBy: createdBy || "testCreatedBy",
      server: "web",
      channel: "chat",
      sender: sender,
      receiver: receiver || "testReceiver",
      message: message,
      time: new Date().toString(),
    });
    await userLog.save();
    console.log(`webserver.js - Line 62 - Message saved to MongoDB: ${message}, ${time}, ${createdBy}, ${sender}, ${receiver}, ${server}, ${channel}`);
  } catch (error) {
    console.error(err);
    throw new Error(`An error occurred while saving the message: ${error}`);
  }
}

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

// Save Message to MongoDB
app.post('/api/save-message', async (req, res) => {
  const time = new Date().toString();
  const username = req.body.username;
  let message = req.body.message;
  let createdBy = req.body.persona;
  let sender = req.body.username || "anonymous"; 
  let receiver = req.body.persona;
  const server = "web";
  const channel = "chat";

  // Log the message to MongoDB for user
  if (username) {
    try {
      await saveMessageToDB(createdBy, sender, receiver, message);
      res.send({ success: true });
    } catch (error) {
      console.error(`An error occurred while calling MongoDB: ${error}`);
      console.error(error.stack);
      res.status(500).send({ error: `An error occurred while calling MongoDB: ${error}` });
    }
  }
});

  
// Call OpenAI API and save response to MongoDB
app.post('/api/response', async (req, res) => { 
  const username = req.body.username;
  const persona = req.body.persona;
  const messageRequest = req.body.message;
  if (messageRequest) {
    try {
    const response = await openaiAPI.callopenai(messageRequest, username, persona);
    const result = response;
    // console.log(`webserver.js - Line 139 - messageRequest: ${messageRequest}`);

    // Save the OpenAI response to MongoDB
    await saveMessageToDB(persona, persona, username, result);
    res.send({ response: result }); 
  } catch (error) {
    console.error(`An error occurred while calling OpenAI API: ${error}`);
    console.error(error.response.data);
    res.status(500).send({ error: `An error occurred while calling OpenAI API: ${error}` });
  }
  }
});


// Get persona data from MongoDB for web
app.get('/api/personas/:personaName', (req, res) => {
  const personaName = req.params.personaName;
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const db = client.db(dbName);
    const collection = db.collection('personas');

    collection.findOne({ 'personas.name': personaName }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error getting persona from database' });
        return;
      }

      if (!result) {
        res.status(404).send({ error: `Persona '${personaName}' not found` });
        return;
      }

      const persona = result.personas.find(p => p.name === personaName);
      res.send({ personas: [persona] });

      client.close();
    });
  });
});

// Update persona data in MongoDB
app.put('/api/personas/:personaName', async (req, res) => {
  const personaName = req.params.personaName;
  const data = req.body.data;

  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('personas');

    const persona = await collection.findOne({ 'personas.name': personaName });

    if (!persona) {
      throw new Error(`Failed to find persona with name ${personaName}`);
    }

    const personaIndex = persona.personas.findIndex(p => p.name === personaName);
    persona.personas[personaIndex].data[0] = data;
    const result = await collection.updateOne(
      { 'personas.name': personaName },
      { $set: { personas: persona.personas } }
    );

    client.close();
    res.send({ success: true });
  } catch (error) {
    console.error(`Failed to update persona data for ${personaName}: ${error}`);
    res.status(500).send({ error: `Failed to update persona data for ${personaName}: ${error}` });
  }
});

// Serve the index.html file
app.get('/', (req, res) => { 
  res.sendFile(__dirname + '/public/index.html'); 
}); 

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

app.use(express.static('public', { 'extensions': ['html', 'js', 'css'] }));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});