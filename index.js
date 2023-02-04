// Start config
require('dotenv').config(); 

// Import discord.js
const client = require("./src/butler.js"); 

// Import mongo.js
const { connect, Log, UserInfo, Link } = require("./src/mongo.js"); 

// Import OpenAI
const openai = require("./src/openai.js");

// Login to Discord
client.login(process.env.DISCORD_TOKEN); 