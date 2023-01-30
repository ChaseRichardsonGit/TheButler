//const uuid = require('uuid');

module.exports = (discordClient, mongoClient) => {
  const db = mongoClient.db("logs");

  return message => {
    if (message.content === 'ping') {
//      const messageId = uuid.v4();
      const messageTimestamp = new Date();
      db.collection("messages").insertOne({
//        _id: messageId,
        message: message.content,
        author: message.author.username,
        timestamp: messageTimestamp
      }, function(err, res) {
        console.log("Message logged to MongoDB with ID:", messageId);
      });
    }
  }
};
