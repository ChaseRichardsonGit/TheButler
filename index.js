// Start config
require('dotenv').config(); 

// Get your persona from your environment
let whoami = process.env.WHOAMI; 

// Import discord.js
const client = require(`./src/${whoami}.js`); 

// Import mongo.js
const { connect, Log, UserInfo, Link } = require("./src/mongo.js"); 

// Import OpenAI
const openai = require("./src/openai.js");

// Login to Discord
client.login(process.env[`${whoami}_TOKEN`]);