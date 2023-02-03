require('dotenv').config(); 
const client = require("./src/discord.js");
const openai = require("./src/openai.js");
const { connect, LogModel, Log } = require("./src/mongo.js");

connect();