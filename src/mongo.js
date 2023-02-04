const mongoose = require("mongoose"); 

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

module.exports = { Log, UserInfo, Link };
