// Start config
require('dotenv').config(); 

// Import discord.js
const client = require(`./src/${process.env.WHOAMI}.js`); 

// Import mongo.js
const { connect, Log, UserInfo, Link } = require("./src/mongo.js"); 

// Import OpenAI
const openai = require("./src/openai.js");

// Start Webserver
// const webserver = require('./webserver');

// const PORT = process.env.PORT || 3000;

// webserver.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
// });

// Login to Discord
client.login(process.env[`${process.env.WHOAMI}_TOKEN`]);