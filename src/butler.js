// Load the environment variables
require('dotenv').config(); 

// Load the external functions
const openai = require('./openai.js');
const clearchat = require('./clearchat.js');
const weather = require('./weather.js');

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
    let userInfo = await UserInfo.findOne({ serverId: message.guild.id, userId: message.author.id });
      if(!userInfo) {
      userInfo = new UserInfo({
          serverId: message.guild.id,
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
    if(message.content.includes(`/https?:\/\/[^\s]+/`)) {
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
  
    const log = new Log({
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

// Listener for DM
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
      if(message.author.bot) return;
        const log = new Log({
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

// Listener for DM Messages for OpenAI
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot) return; 
       openai.callopenai(message);
    }
});

// Listner for Channel Messages
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

console.log(`TheButler is online!\n`);

module.exports = client;