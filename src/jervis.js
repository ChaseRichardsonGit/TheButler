// Load the environment variables 
require('dotenv').config(); 

// Load the external functions
const openai = require('./openai.js');
const response = require('./openai.js');

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

// Listener for your name only console logs for right now. 
client.on('messageCreate', async function(message){
  if(message.channel.type !== Discord.ChannelType.DM) {
  if(message.author.bot) return; {
      if(message.content.includes(process.env.WHOAMI)) {
        let response = await openai.callopenai(message);
        openai.callopenai(message);
        message.channel.send(response);
}}
}});


// Listener for Direct Message OpenAI Dialogue
client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
  if(message.author.bot) return; 
  try {
    const log = new Log({
      createdBy: process.env.WHOAMI,
      server: "-",
      channel: "directMessage",
      sender: message.author.username,
      receiver: process.env.WHOAMI,
      message: message.content,
      time: new Date().toString()
    });
    log.save().then(() => {
    }).catch(err => {
      console.error(err);
    });
    
    let response = await openai.callopenai(message);
    const whoami = process.env.WHOAMI;
//    console.log(whoami);
    const whoamiLower = whoami.toLowerCase();
//    console.log(whoamiLower);
    const regex = new RegExp(`^${whoamiLower}: (.*)`);
//    console.log(regex);
    const match = response.match(regex);
//    console.log(match);
    if (match) {
      const parsedData = match[1];
//      console.log(parsedData);
      message.author.send(parsedData);
    } else {
      message.author.send(response);
      console.log("No match found");
    }


    const log2 = new Log({
      createdBy: process.env.WHOAMI,
      server: "-",
      channel: "directMessage",
      sender: process.env.WHOAMI,
      receiver: message.author.username,
      message: response,
      time: new Date().toString()
    });
    log2.save().then(() => {
    }).catch(err => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
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
  sender: message.author.username,
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



console.log(`${process.env.WHOAMI} is online as of ${Date()}!\n`);

// // Checks every user on the server for their last message and DM's them if it's been > 360 minutes since their last Butler DM
// setInterval(async function() {
//   try {
//     let users = await UserInfo.find({});
//     let currTime = new Date();
//     for(let i = 0; i < users.length; i++) {
//       let user = users[i];
//       let lastMessage = new Date(user.time);
//       let timeDiff = currTime - lastMessage;
//       let minutesDiff = timeDiff / 60000;
//       if(minutesDiff > 1080 ) {
//         let userDM = client.users.cache.get(user.userId);
//         if (userDM && !userDM.bot) {
//           userDM.send("It's been a while since you last sent a message, I hope everything is going well! Is there anything you would like to talk about?");
//           console.log(`Sent message to ${user.sender} after ${minutesDiff} minutes at ${Date()}\n`);
// //          console.log(users[i].time);
//         }
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }, 300000); 


// Timer to check for inactivity in private channel
// setInterval(async function() {
//   try {
//   const privateChannel = client.channels.cache.find(channel => channel.name === 'private');
//   const messages = await privateChannel.messages.fetch();
//   const lastMessage = messages.last();
//   const timeDiff = new Date() - lastMessage.createdAt;
//   const minutesDiff = timeDiff / 60000;
  
  
//   if(minutesDiff > 1 ) {
//   const jarvisMessage = "jervis how are you today?";
//   privateChannel.send(jarvisMessage);
//   }
//   } catch (error) {
//   console.error(error);
//   }
//   }, 30000);

module.exports = client;