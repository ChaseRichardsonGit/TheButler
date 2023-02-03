// Load the environment variables
require('dotenv').config(); 

// Load the external functions
const openai = require('./src/openai.js');
const clearchat = require('./src/clearchat.js');
const weather = require('./src/weather.js');

// Load the Discord 
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Define Intents and Partials for Discord
const client = new Client({ 
	intents: [ 
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildMembers,
	],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    ]
}); 

// Listener for Direct Messages
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot) return;
    if(message.content.startsWith("/")) {
        message.author.send(`Slash commands are so 2022, just talk to me.`); return;
    } 
    else {
        // Let preprompt = message.author;
        openai.callopenai(message);
    }}
});

// Listner for Channel Messages
client.on("messageCreate", async function(message){
    if(message.channel.type != Discord.ChannelType.DM){
    if(message.author.bot) return;
    if(message.content.startsWith("/PC")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        clearchat(message);
    } else
    if (message.content.startsWith("/PM")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        message.author.send(`Hello, I'm Puerus.  How can I help you?`);
    } else
    if (message.content.startsWith("/PW")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        const OWMapiKey = process.env.OWMapiKey;
        const zip = message.content.split(' ')[1];
        if(!zip) return message.channel.send("Please provide a zip code after the command")
            weather.getWeather(zip, message, OWMapiKey);
    }}
});

console.log(`Puerus is online!\n`);

// Login to the Discord API
client.login(process.env.DISCORD_TOKEN);