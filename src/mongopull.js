const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://anarche:p4ssw0rd@discordlogs.epfawzd.mongodb.net/testing?retryWrites=true&w=majority';
const dbName = 'testing';
const collectionName = 'personas';

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) throw err;

  console.log('Connected successfully to MongoDB');

  const db = client.db(dbName);

  db.collection(collectionName).find({ "personas.name": "butler" }).toArray((err, result) => {
    if (err) throw err;

    console.log(result[0].personas.filter(persona => persona.name === "butler"));

    client.close();
  });
});
