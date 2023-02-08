// Start config
require('dotenv').config(); 

// Import discord.js
const client = require(`./src/${process.env.WHOAMI}.js`); 

// Import mongo.js
const { connect, Log, UserInfo, Link } = require("./src/mongo.js"); 

// Import OpenAI
const openai = require("./src/openai.js");

// Login to Discord
client.login(process.env[`${process.env.WHOAMI}_TOKEN`]);