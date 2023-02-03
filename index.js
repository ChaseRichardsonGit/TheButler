// Start config
require("dotenv").config(); 

// Import mongo.js
const { connect } = require("./mongo.js"); 

// Import discord.js
const client = require("./discord.js"); 

// Login to Discord
client.login(process.env.BOT_TOKEN); 