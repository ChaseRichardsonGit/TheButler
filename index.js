// Get your persona from your environment

let whoami = process.argv[2];
if (whoami) { const whoami = process.argv[2];
} else { const whoami = 'butler'; }

// Load the Environment Variables from .env
require('dotenv').config(); 

// Import discord.js to Load Discord Modules and AI Persona
if (whoami && whoami !== "butler") {
  let personaToken = whoami + "_TOKEN";
  let DiscordToken = process.env[personaToken];
  const client = require(`./src/${whoami}.js`); 
//  console.log("Starting " + whoami);
  client.login(DiscordToken);
} else {
  const client = require(`./src/butler.js`); 
//  console.log("Starting the butler");
  const webserver = require('./webserver');
}

// Import mongo.js to Load Database
const { connect, Log, UserInfo, Link } = require("./src/mongo.js"); 

// Import openAI to Load OpenAI
const openai = require("./src/openai.js");