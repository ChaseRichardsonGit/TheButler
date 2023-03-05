// Get your persona from your environment otheriwse assume the butler
let persona = process.argv[2];
if (persona) { const persona = process.argv[2];
} else { const persona = 'Butler'; }

const mongoose = require("mongoose"); 
const { MongoClient } = require("mongodb");
const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.MONGO_DBNAME;
const { ObjectId } = require('mongodb');

const userInfoSchema = new mongoose.Schema({ 
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    server: {
        type: String,
        required: true
    },
    messagesSent: {
        type: Number,
        default: 0,
        required: true
    },
    cost_total: {
        type: Number,
        default: 0,
        required: true
    },
    time: {
      type: Date,
      required: true
  }
    
});
mongoose.set('strictQuery', true);
const UserInfo = mongoose.model("UserInfo", userInfoSchema);

const messageSchema = new mongoose.Schema({
    createdBy: {
        type: String,
        required: true
    }, 
    server: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
      type: String,
      required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
});
const Log = mongoose.model("Log", messageSchema);

const linkSchema = new mongoose.Schema({
  server: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
});
const Link = mongoose.model("Link", linkSchema);

const costSchema = new mongoose.Schema({
    sender: {
      type: String,
      required: true
    },
    persona: {
      type: String,
      required: true
    },
    cost: {
      type: String,
      required: true
    },
    characters: {
      type: String,
      required: true
    },
    total_tokens: {
      type: String,
      required: true
    },
    prompt_tokens: {
      type: String,
      required: true
    },
    completion_tokens: {
      type: String,
      required: true
    },
    max_tokens: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    preprompttext: {
      type: String,
      required: true
    },
    lastmessages: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    }
});
const Cost = mongoose.model("Cost", costSchema);

const connect = () => {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection.on("error", error => {
        console.error("MongoDB connection error: ", error);
    });

    mongoose.connection.once("open", () => {
//        console.log("Connected to MongoDB");
    });
};

// Connect to MongoDB
connect(); 

const getPersonaData = async (persona) => {
  // console.log(`mongo.js - Line 170 - persona: ${persona}\n`)
  const url = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  const collectionName = 'personas';

  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db(dbName);

  const result = await db.collection(collectionName).find({ "personas.name": `${persona}` }).toArray();
  if (!result || !result[0] || !result[0].personas) {
      console.error("No persona data found");
      return;
  }
  
  const personaDatas = result[0].personas.find(p => p.name === `${persona}`);
  if (!personaDatas) {
      console.error(`No persona data found for ${persona}`);
      return;
  }

  let personaData = "";
  for (const key in personaDatas) {
      if (key.startsWith("data")) {
          personaData += personaDatas[key] + " ";
      }
  }

  client.close();
  // console.log(`mongo.js - Line 198 - persona: ${personaData.toString()}\n`)
  return personaData.toString();
};

//getChatLog from Mongo for context
const getChatLog = async (sender, receiver) => { 
//  console.log(`mongo.js - Line 165 - sender: ${sender} receiver: ${receiver}`)
  const url = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  const collectionName = process.env.MONGO_COLLECTION_LOGS_NAME;
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db(dbName);
  const chatLog = await db.collection(collectionName).find(
      {
        $or: [
          { $and: [{sender: receiver},{receiver: sender}]},
          { $and: [{sender: sender},{receiver: receiver}]},
        ]
      }
    ).sort({ _id: -1 }).limit(20).toArray();
//    console.log("mongo.js - Line 179 - sender: " + sender + " receiver: " + receiver);
  client.close();
  return chatLog; 
};

//updatePersonaData in MongoDB
async function updatePersonaData(name, data) {
  const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
  const db = client.db(dbName);
  const collection = db.collection('personas');
  const persona = await collection.findOne({ 'personas.name': name });

  if (!persona) {
    throw new Error(`Failed to find persona with name ${name}`);
  }

  const updatedPersonas = persona.personas.map(p => {
    if (p.name === name) {
      return { ...p, ...data };
    }
    return p;
  });

  const result = await collection.updateOne({ 'personas.name': name }, { $set: { personas: updatedPersonas } });
  client.close();
  return result;
}

// Export the Log, UserInfo, PersonData, getChatLog, and Link models
module.exports = { Log, UserInfo, Link, Cost, getPersonaData, getChatLog };
