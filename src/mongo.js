const mongoose = require("mongoose");

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
  

mongoose.set('strictQuery', true);

const Log = mongoose.model("Log", messageSchema);

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

module.exports = { Log };