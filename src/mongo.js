const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
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

module.exports = mongoose;
