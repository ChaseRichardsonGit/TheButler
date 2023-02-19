// Import the MongoDB driver
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb+srv://anarche:p4ssw0rd@discordlogs.epfawzd.mongodb.net/testing?retryWrites=true&w=majority';

// Database name
const dbName = 'testing';

// Collection name
const collectionName = 'personas';

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) throw err;

  console.log('Connected successfully to MongoDB');

  const db = client.db(dbName);

  // Create the new schema
  const schema = {
    personaName: 'Persona Collection',
    personas: [
      {
        name: 'butler',
        data: ['You are TheButler, a friendly Discord Chatbot.'],
        data2: ['Your purpose is to serve the discord channel.']
      },
      {
        name: 'jarvis',
        data: ['You are Jarvis, a technical Discord Chatbot.']
      },
      {
        name: 'puerus',
        data: ['You are Puerus, a philosphohical Discord Chatbot.']
      }
    ]
  };

  // Insert the schema into the collection
  db.collection(collectionName).insertOne(schema, (err, result) => {
    if (err) throw err;

    console.log(`Schema created successfully in the ${collectionName} collection`);

    client.close();
  });
});
