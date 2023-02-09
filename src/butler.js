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
const { UserInfo, Link, Cost, Log } = require('./mongo.js'); 


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
//      console.log(`UserInfo updated for user ${message.author.username} with messagesSent: ${userInfo.messagesSent}\n`);
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
//        console.log(`Link saved for user ${message.author.username} with link: ${link.link}\n`);
      }).catch(err => {
        console.error(err);
      });
    }

// Log the message to MongoDB    
    const log = new Log({ 
        bot: process.env.WHOAMI,
        server: message.guild.name,
        channel: message.channel.name,
        username: message.author.username,
        message: message.content,
        time: new Date().toString()
      });
      log.save().then(() => {
//        console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
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

// Listener to Log Direct Messages UserInfo to MongoDB
client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
  let userInfo = await UserInfo.findOne({ userId: message.author.id });
  if(!userInfo) {
  userInfo = new UserInfo({
  server: "-",
  userId: message.author.id,
  username: message.author.username,
  messagesSent: 1,
  time: new Date()
  });
  } else {
  userInfo.time = new Date();
  }
  userInfo.save().then(() => {
//  console.log(`UserInfo updated for user ${message.author.username} with time: ${userInfo.time}\n`);
  }).catch(err => {
  console.error(err);
  });
  }
});

// Listener to Log Direct Messages
client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot) return;
      const log = new Log({
      bot: process.env.WHOAMI,
      server: "-",
      channel: "directMessage",
      username: message.author.username,
      message: message.content,
      time: new Date().toString()
    });
  
    log.save().then(() => {
//      console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
    }).catch(err => {
      console.error(err);
    });
  }
});


// Listener to Log Bot Direct Message Responses
client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
    if(message.author.bot){
    const log = new Log({
      bot: process.env.WHOAMI,
      server: "-",
      channel: "directMessage",
      username: message.author.username,
      message: message.content,
      time: new Date().toString()
    });
  
    log.save().then(() => {
//      console.log("Direct Message logged to MongoDB");
    }).catch(err => {
      console.error(err);
    });
  }}
});

// Listner for Slash Commands
client.on("messageCreate", async function(message){
    if(message.channel.type != Discord.ChannelType.DM){
    if(message.author.bot) return;
    if(message.content.startsWith("/BC")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        clearchat(message);
    } else
    if(message.content.startsWith("/BM")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        message.author.send(`Hello, I'm TheButler.  How can I help you?`);
    } else
    if(message.content.startsWith("/BW")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        const OWMapiKey = process.env.OWMapiKey;
        const zip = message.content.split(' ')[1];
        if(!zip) return message.channel.send("Please provide a zip code after the command")
            weather.getWeather(zip, message, OWMapiKey);
    }}
});

console.log(`${process.env.WHOAMI} is online!\n`);

// Checks every user on the server for their last message and DM's them if it's been > 120 minutes since their last Butler DM
setInterval(async function() {
  try {
    let users = await UserInfo.find({});
    let currTime = new Date();
    for(let i = 0; i < users.length; i++) {
      let user = users[i];
      let lastMessage = new Date(user.time);
      let timeDiff = currTime - lastMessage;
      let minutesDiff = timeDiff / 60000;
      if(minutesDiff > 360 ) {
        let userDM = client.users.cache.get(user.userId);
        if (userDM && !userDM.bot) {
          userDM.send("It's been a while since you last sent a message, I hope everything is going well! Is there anything you would like to talk about?");
          console.log(`Sent message to ${user.username} after ${minutesDiff} minutes\n`);
          console.log(users[i].time);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}, 600000); 
module.exports = client;

