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
    }
});

mongoose.set('strictQuery', true);

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

const messageSchema = new mongoose.Schema({
    bot: {
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
    username: {
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

const connect = () => {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection.on("error", error => {
        console.error("MongoDB connection error: ", error);
    });

    mongoose.connection.once("open", () => {
        console.log("Connected to MongoDB");
    });
};

connect();


const getPersonaData = async (persona) => {
    const url = process.env.MONGO_URI;
    const dbName = 'testing';
    const collectionName = 'personas';
  
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);

    const result = await db.collection(collectionName).find({ "personas.name": "butler" }).toArray();
    if (!result || !result[0] || !result[0].personas) {
        console.error("No persona data found");
        return;
    }
    
    const personaData = result[0].personas.find(p => p.name === "butler");
    if (!personaData) {
      console.error(`No persona data found for ${persona}`);
      return;
    }
    
    client.close();
    
    return personaData;
    
};

// const getChatLog = async (persona) => {
//     const url = 'mongodb+srv://anarche:p4ssw0rd@discordlogs.epfawzd.mongodb.net/testing?retryWrites=true&w=majority';
//     const dbName = 'testing';
//     const collectionName = 'logs';
  
//     const client = await MongoClient.connect(url, { useNewUrlParser: true });
//     const db = client.db(dbName);

//     const ChatLog = await db.collection(collectionName).find({
//         $or: [ 
//             {username: persona}
//         ]
//     }).sort({_id: -1}).limit(3).toArray();
    
//     console.log(ChatLog);

//     client.close();
    
//     return ChatLog; 
// };

const getChatLog = async (persona, bot) => {
    const url = process.env.MONGO_URI;
    const dbName = 'testing';
    const collectionName = 'logs';
  
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db(dbName);

    const ChatLog = await db.collection(collectionName).find({
        username: persona,
        bot: bot
    }).sort({_id: -1}).limit(3).toArray();
    
    console.log(ChatLog);

    client.close();
    
    return ChatLog; 
};

// Export the Log, UserInfo, and Link models
module.exports = { Log, UserInfo, Link, getPersonaData, getChatLog };