// Load the Environment Variables from .env
require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.WEBSERVER_PORT;
const path = require('path');

const MongoClient = require('mongodb').MongoClient;
const { Log, getChatLog, getPersonaData, updatePersonaData, getChatToday } = require('./src/mongo.js');
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
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');

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
    console.log(`webserver.js - Line 68 - Message saved to MongoDB: ${message}, ${time}, ${createdBy}, ${sender}, ${receiver}, ${server}, ${channel}`);
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

app.put('/api/personas/:personaName', async (req, res) => {
  const personaName = req.params.personaName;
  const data = req.body;

  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('personas');

    const result = await collection.updateOne(
      { 'personas.name': personaName },
      { $set: { 'personas.$': data } }
    );

    client.close();
    res.send({ success: true });
  } catch (error) {
    console.error(`Failed to update persona data for ${personaName}: ${error}`);
    res.status(500).send({ error: `Failed to update persona data for ${personaName}: ${error}` });
  }
});

// Add a new persona to the database
app.post('/api/personas', async (req, res) => {
  const personaName = req.body.name;
  const personaData = req.body.data;

  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('personas');

    // Check if the persona already exists
    const existingPersona = await collection.findOne({ 'personas.name': personaName });

    if (existingPersona) {
      throw new Error(`Persona with name ${personaName} already exists`);
    }

    // Add the new persona to the collection
    const result = await collection.updateOne(
      {},
      { $push: { personas: { name: personaName, data: [personaData] } } },
      { upsert: true }
    );

    client.close();
    res.send({ success: true });
  } catch (error) {
    console.error(`Failed to add new persona ${personaName}: ${error}`);
    res.status(500).send({ error: `Failed to add new persona ${personaName}: ${error}` });
  }
});

// Route to load chat history for a specific user and persona
app.post('/api/chat-history', (req, res) => {
  const username = req.body.username;
  const persona = req.body.selectedPersona;
  
  // Retrieve chat history from MongoDB
  Log.find(
    {
      $or: [
        { sender: username, receiver: persona },
        { sender: persona, receiver: username },
      ],
    },
    (err, messages) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Error retrieving chat history' });
        return;
      }

      // Return the chat history data in JSON format
      res.json(messages);
    }
  );
});

// Get sender statistics for a given username from MongoDB
app.get('/api/sender-stats', async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('costs');

    const username = req.query.username;
    if (!username) {
      throw new Error('No username provided');
    }

    // Aggregate the collection by sender for the given username
    const results = await collection.aggregate([
      {
        $match: {
          sender: username,
        },
      },
      {
        $sort: {
          time: -1
        }
      },
      {
        $group: {
          _id: "$sender",
          total_messages: { $sum: 1 },
          total_cost: { $sum: { $toDouble: "$cost" } },
          last_message: { $first: "$time" },
          total_tokens_used: { $sum: { $toInt: "$total_tokens" } }
        },
      },
      {
        $project: {
          _id: 0,
          totalMessages: "$total_messages",
          totalCost: "$total_cost",
          lastMessage: "$last_message",
          totalTokensUsed: "$total_tokens_used"
        },
      },
    ]).toArray();

    client.close();
    if (results.length === 0) {
      res.status(404).send({ error: `No stats found for user ${username}` });
    } else {
      res.send(results[0]);
    }
  } catch (error) {
    console.error(`Failed to get sender statistics from MongoDB: ${error}`);
    res.status(500).send({ error: `Failed to get sender statistics from MongoDB: ${error}` });
  }
});

// Get server statistics from MongoDB
app.get('/api/server-stats', async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('costs');

    const results = await collection.aggregate([
      {
        $sort: {
          time: -1
        }
      },
      {
        $group: {
          _id: "$sender",
          total_messages: { $sum: 1 },
          total_cost: { $sum: { $toDouble: "$cost" } },
          last_message: { $first: "$time" },
          total_tokens_used: { $sum: { $toInt: "$total_tokens" } }
        },
      },
      {
        $project: {
          _id: 0,
          sender: "$_id",
          totalMessages: "$total_messages",
          totalCost: "$total_cost",
          lastMessage: "$last_message"
        },
      },
    ]).toArray();

    client.close();
    res.send(results);
  } catch (error) {
    console.error(`Failed to get server statistics from MongoDB: ${error}`);
    res.status(500).send({ error: `Failed to get server statistics from MongoDB: ${error}` });
  }
});

// Get sender stats and messages for a specific sender
app.get('/sender-stats/:sender', async (req, res) => {
  const sender = req.params.sender;

  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('costs');

    const messages = await collection.find({ sender: sender }).toArray();

    const results = await collection.aggregate([
      {
        $match: {
          sender: sender
        }
      },
      {
        $group: {
          _id: "$sender",
          total_messages: { $sum: 1 },
          total_cost: { $sum: { $toDouble: "$cost" } },
          total_tokens_used: { $sum: { $toInt: "$total_tokens" } },
          persona: { $first: "$persona" },
          characters: { $first: "$characters" },
          total_tokens: { $first: "$total_tokens" },
          prompt_tokens: { $first: "$prompt_tokens" },
          completion_tokens: { $first: "$completion_tokens" },
          max_tokens: { $first: "$max_tokens" },
          preprompttext: { $first: "$preprompttext" },
          lastmessages: { $last: "$message" },
        },
      },
      {
        $project: {
          _id: 0,
          sender: "$_id",
          totalMessages: "$total_messages",
          totalCost: "$total_cost",
          totalTokensUsed: "$total_tokens_used",
          persona: "$persona",
          characters: "$characters",
          total_tokens: "$total_tokens",
          prompt_tokens: "$prompt_tokens",
          completion_tokens: "$completion_tokens",
          max_tokens: "$max_tokens",
          preprompttext: "$preprompttext",
          lastmessages: "$lastmessages",
        },
      }
    ]).toArray();

    client.close();

    const data = {
      sender: sender,
      messages: messages
    };
    
    if (results.length > 0) {
      data.totalMessages = results[0].totalMessages;
      data.totalCost = results[0].totalCost.toFixed(5);
      data.totalTokensUsed = results[0].totalTokensUsed;
      data.persona = results[0].persona;
      data.characters = results[0].characters;
      data.total_tokens = results[0].total_tokens;
      data.prompt_tokens = results[0].prompt_tokens;
      data.completion_tokens = results[0].completion_tokens;
      data.max_tokens = results[0].max_tokens;
      data.preprompttext = results[0].preprompttext;
      data.lastmessages = results[0].lastmessages;
    } else {
      data.totalMessages = 0;
      data.totalCost = 0;
      data.totalTokensUsed = 0;
      data.persona = '';
      data.characters = '';
      data.total_tokens = '';
      data.prompt_tokens = '';
      data.completion_tokens = '';
      data.max_tokens = '';
      data.preprompttext = '';
      data.lastmessages = '';
    }

    res.render('sender-stats', data);
  } catch (error) {
    console.error(`Failed to get sender statistics and messages from MongoDB: ${error}`);
    res.status(500).send({ error: `Failed to get sender statistics and messages from MongoDB: ${error}` });
  }
});

app.put('/api/history/:sender/:receiver/:count', async (req, res) => {
  const sender = req.params.sender;
  const receiver = req.params.receiver;
  const count = parseInt(req.params.count);

  try {
    const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection('logs');

    // Find the N most recent documents to update
    const recentDocs = await collection.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    })
      .sort({ time: -1 })
      .limit(16)
      .toArray();
    const recentDocIds = recentDocs.map(doc => doc._id);

    // Update the history field of the selected documents
    const docsToUpdate = await collection.find({ _id: { $in: recentDocIds }, history: true })
      .sort({ time: 1 })
      .limit(count)
      .toArray();
    const idsToUpdate = docsToUpdate.map(doc => doc._id);
    const result = await collection.updateMany(
      { _id: { $in: idsToUpdate } },
      { $set: { history: false } }
    );

    client.close();
    res.send({ success: true });
  } catch (error) {
    console.error(`Failed to update history for ${sender} and ${receiver}: ${error}`);
    res.status(500).send({ error: `Failed to update history for ${sender} and ${receiver}: ${error}` });
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