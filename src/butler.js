// Get your persona from your environment otheriwse assume the butler
let whoami = process.argv[2];
if (whoami) {   
    const whoami = process.argv[2];
//    console.log("args from startup in puerus.js: " + whoami);
}
    else {  
    const whoami = 'butler';  
//    console.log("No persona passed... starting as" + whoami); 
}

// Load the environment variables
require('dotenv').config(); 

// Load the external functions if you're the butler
const openai = require('./openai.js');
    if (whoami == 'butler') {
        const clearchat = require('./clearchat.js');
        const weather = require('./weather.js');
        const response = require('./openai.js');
        }

// Load the Discord API and Mongo Database
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
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

// Listener for General (Butler Only)
client.on('messageCreate', async function(message){
    if(whoami == 'butler') {
    if(message.channel.type !== Discord.ChannelType.DM) {
    if(message.author.bot) return;
    let userInfo = await UserInfo.findOne({ server: message.guild.name, userId: message.author.id });
      if(!userInfo) {
      userInfo = new UserInfo({
          server: message.guild.name,
          userId: message.author.id,
          sender: message.author.username,
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
        sender: message.author.username,
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
        createdBy: whoami,
        server: message.guild.name,
        channel: message.channel.name,
        sender: message.author.username,
        receiver: "all",
        message: message.content,
        time: new Date().toString()
      });
      log.save().then(() => {
//        console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
      }).catch(err => {
        console.error(err);
        });
    }}
});

// Listener for your name in channel messages and start an OpenAI Dialogue
client.on('messageCreate', async function(message){
  if(message.channel.type !== Discord.ChannelType.DM) {
  if(message.author.bot) return; {
      if(message.content.includes(whoami)) {
        let response = await openai.callopenai(message);
        openai.callopenai(message, message.author.username);
        message.channel.send(response);
}}
}});

// Listens for DM's, Log the message and starts an OpenAI Dialogue
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
        if(message.author.bot) return; 
            try {
                const log = new Log({
                    createdBy: whoami,
                    server: "-",
                    channel: "directMessage",
                    sender: message.author.username,
                    receiver: whoami,
                    message: message.content,
                    time: new Date().toString()
                });
                    log.save().then(() => {
                }).catch(err => {
                    console.error(err);
                });
                
    let response = await openai.callopenai(message);
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
      createdBy: whoami,
      server: "-",
      channel: "directMessage",
      sender: whoami,
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

// Listner for Slash Commands
client.on("messageCreate", async function(message){
    if(message.channel.type != Discord.ChannelType.DM){
    if(message.author.bot) return;
    if(message.content.startsWith("/BC")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        clearchat(message);
    } else
    if(message.content.startsWith("/BP")) {
        // console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        // message.author.send(`Hello, I'm TheButler.  How can I help you?`);
        console.log("Puerus starting here I hope!");
    } else
    if(message.content.startsWith("/BW")) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        const OWMapiKey = process.env.OWMapiKey;
        const zip = message.content.split(' ')[1];
        if(!zip) return message.channel.send("Please provide a zip code after the command")
            weather.getWeather(zip, message, OWMapiKey);
    }
}});

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

console.log(`${whoami} is online as of ${Date()}!\n`);

module.exports = client;