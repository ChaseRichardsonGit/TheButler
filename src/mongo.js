const mongoose = require("mongoose"); 
const { MongoClient } = require("mongodb");

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
  username: {
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
    username: {
      type: String,
      required: true
    },
    characters: {
      type: String,
      required: true
    },
    tokens: {
      type: String,
      required: true
    },
    cost: {
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

//getPersonaData from MongoDB
const getPersonaData = async (persona) => {
    const url = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = 'personas';
  
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);

    const result = await db.collection(collectionName).find({ "personas.name": `${process.env.WHOAMI}` }).toArray();
    if (!result || !result[0] || !result[0].personas) {
        console.error("No persona data found");
        return;
    }
    
    const personaData = result[0].personas.find(p => p.name ===  `${process.env.WHOAMI}` );
    if (!personaData) {
      console.error(`No persona data found for ${persona}`);
      return;
    }
    
    client.close();
    
    return personaData;
};

//getChatLog from Mongo for context
const getChatLog = async (sender, receiver) => { 
  const url = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  const collectionName = process.env.MONGO_COLLECTION_LOGS_NAME;
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db(dbName);
  const chatLog = await db.collection(collectionName).find(
      // { 
      //   $and: [
      //     { $or: [ (sender && { sender: sender }), (receiver && { sender: receiver }) ] },
      //     { channel: 'directMessage' }
      //   ] 
      //  }
      // { 
      //   $and: [
      //     { $or: [ (sender && { sender: sender }), (receiver && { receiver: receiver }) ] },
      //     { $or: [ (receiver && { sender: sender }), (sender && { receiver: receiver }) ] },
      //     // { $and: [ (sender && { sender: receiver }), (receiver && { receiver: sender }) ] },
      //     { channel: 'directMessage' }
      //     ] 
      //  }
      {
        $or: [
          { $and: [{sender: receiver},{receiver: sender}]},
          { $and: [{sender: sender},{receiver: receiver}]},
        ]
      }
    ).sort({ _id: -1 }).limit(10).toArray();
  client.close();
  console.log("sender: " + sender + " receiver: " + receiver);
  return chatLog; 
};

// Export the Log, UserInfo, PersonData, getChatLog, and Link models
module.exports = { Log, UserInfo, Link, Cost, getPersonaData, getChatLog };