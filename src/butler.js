// Load the environment variables 
require('dotenv').config(); 

// Load the external functions
const openai = require('./openai.js');
const clearchat = require('./clearchat.js');
const weather = require('./weather.js');

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

// Listener for General
client.on('messageCreate', async function(message){
    if(message.channel.type !== Discord.ChannelType.DM) {
    if(message.author.bot) return;
    let userInfo = await UserInfo.findOne({ server: message.guild.name, userId: message.author.id });
      if(!userInfo) {
      userInfo = new UserInfo({
          server: message.guild.name,
          userId: message.author.id,
          username: message.author.username,
          messagesSent: 1
      });
    } else {
      userInfo.messagesSent += 1;
    }
      userInfo.save().then(() => {
      console.log(`UserInfo updated for user ${message.author.username} with messagesSent: ${userInfo.messagesSent}\n`);
    }).catch(err => {
      console.error(err);
    });
  
    // Check if the message contains a link
    if(message.content.includes("http")) {
      const link = new Link({
        server: message.guild.name,
        channel: message.channel.id,
        username: message.author.username,
        link: message.content,
        time: message.createdAt.toString()
      });
  
      link.save().then(() => {
        console.log(`Link saved for user ${message.author.username} with link: ${link.link}\n`);
      }).catch(err => {
        console.error(err);
      });
    }

// Log the message to MongoDB    
    const log = new Log({ 
        bot: whoami,
        server: message.guild.name,
        channel: message.channel.name,
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

    const log = new Log({
      bot: whoami,
      server: "-",
      channel: "directMessage",
      username: message.author.username,
      message: message.content,
      time: new Date().toString()
    });
  
    log.save().then(() => {
      console.log("Direct Message logged to MongoDB");
    }).catch(err => {
      console.error(err);
    });
  }
});

// Listner for Slash Commands
client.on("messageCreate", async function(message){
    if(message.channel.type != Discord.ChannelType.DM){
    if(message.author.bot) return;
    if(message.content.startsWith("/PC")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        clearchat(message);
    } else
    if(message.content.startsWith("/PM")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        message.author.send(`Hello, I'm Puerus.  How can I help you?`);
    } else
    if(message.content.startsWith("/PW")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        const OWMapiKey = process.env.OWMapiKey;
        const zip = message.content.split(' ')[1];
        if(!zip) return message.channel.send("Please provide a zip code after the command")
            weather.getWeather(zip, message, OWMapiKey);
    }}
    });

console.log(`${whoami} is online!\n`);

module.exports = client;