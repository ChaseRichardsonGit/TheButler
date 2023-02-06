// Load the environment variables
require('dotenv').config(); 

// Load the external functions
const openai = require('./openai.js');

// Get your persona from your environment
let whoami = process.env.WHOAMI;

// Load the Discord 
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Define Mongo and load the database
const { UserInfo, Link, Log } = require('./mongo.js'); 

// Define Intents and Partials for Discord
const client = new Client({ 
	intents: [ 
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
	],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    ]
}); 

// Listener for General only console logs for right now. 
client.on('messageCreate', async function(message){
    if(message.channel.type !== Discord.ChannelType.DM) {
    if(message.author.bot) return; {
        if(message.content.includes("puerus")) {
            console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
            openai.callopenai(message);
            message.channel.send(`I heard your call ${message.author.username} and have sent you a message so we can chat privately.`);
        } else
        if(message.content.startsWith("/PM")) {
            console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
            message.author.send(`Hello, I'm Puerus.  How can I help you?`);
        }}}
    }); 

// Listener for Direct Message OpenAI Dialogue
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot) return; 
       openai.callopenai(message);
    }
});

// Listener to Log Direct Messages
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
      if(message.author.bot) return;
        const log = new Log({
        bot: whoami,
        server: "-",
        channel: "directMessage",
        username: message.author.username,
        message: message.content,
        time: new Date().toString()
      });
    
      log.save().then(() => {
        console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
      }).catch(err => {
        console.error(err);
      });
    }
});

// Listener to Log Bot Direct Message Responses
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot) {
    const log = new Log({
        bot: whoami,
        server: "-",
        channel: "directMessage",
        username: message.author.username,
        message: message.content,
        time: new Date().toString(),
    });
    
    log.save().then(() => {
        console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
    }).catch(err => {
        console.error(err);
    })
    }}
});

console.log(`${whoami} is online!\n`);

module.exports = client;