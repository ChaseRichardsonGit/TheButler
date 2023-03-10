// Get your persona from your environment otheriwse assume the butler
let persona = process.argv[2];
if (persona) { let persona = process.argv[2];
} else { let persona = 'Butler';  }

let slashPrefix = persona.substring(0, 1);

// Load the environment variables
require('dotenv').config(); 

// Load the external functions if you're the butler
const openai = require('./openai.js');

if (persona == 'Butler') {
  const clearchat = require('./clearchat.js');
  const { updateUserInfo } = require('./utils.js'); 
}

// Load the Discord API and Mongo Database
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials, Utils } = require('discord.js');
const { Link, Cost, Log, updateUserInfo } = require('./mongo.js'); 

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
  if(persona == 'Butler') {
  if(message.channel.type !== Discord.ChannelType.DM) {
  if(message.author.bot) return;
  if(!message.content.trim()) return;


  // Check if the message contains a link
  if(message.content.includes("http"))
      {
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
      createdBy: persona,
      server: message.guild.name,
      channel: message.channel.name,
      sender: message.author.username,
      receiver: "all",
      message: message.content,
      time: new Date().toString()
    });
    log.save().then(() => {
//       console.log(`Message logged to MongoDB: ${message.author.username}: ${message.content}\n`);
    }).catch(err => {
      console.error(err);
      });
  }}
});



// Listener for persona messages
client.on('messageCreate', async function(message) {
  if (message.channel.type !== Discord.ChannelType.DM && message.author.username !== persona && message.content.includes(persona)) {
    try {
      if (message.channel.isThread()) {
        // Reply to existing thread
        const thread = message.channel;
        console.log(`Joined thread: ${thread.name}`);
        
        // Add the following if statement to check for "We are done here." in the message content
        if (message.content.includes("We are done here.")) {
          return;
        }

        const isThreadCreationMessage = message.content.includes(`${persona} has created a thread:`);

        let response = isThreadCreationMessage ? '' : await openai.callopenai(message, message.author.username, persona);

        if (!message.author.bot && !isThreadCreationMessage) {
          const log = new Log({
            createdBy: persona,
            server: message.guild.name,
            channel: message.channel.name,
            sender: persona,
            receiver: message.author.username,
            message: response,
            time: new Date().toString()
          });
          log.save().then(() => {
            // console.log(`Message logged to MongoDB: ${persona}: ${response}\n`);
          }).catch(err => {
            console.error(err);
          });
        }

        setTimeout(() => {
          // Trim response if it's 2000 characters or more down to 1999 for Discord.
          if (response.length > 1999) {
            response = response.substring(0, 1999);
          }
          if (!isThreadCreationMessage) {
            thread.send(response);
          }
        }, 5000); // wait for 5 seconds before sending the response

        if (!isThreadCreationMessage) {
          const log = new Log({
            createdBy: persona,
            server: message.guild.name,
            channel: message.channel.name,
            sender: message.author.username,
            receiver: persona,
            message: message.content,
            time: new Date().toString()
          });
          log.save().then(() => {

          }).catch(err => {
            console.error(err); 
          });
        }
      } else {
        // Create new thread
        const thread = await message.channel.threads.create({
          name: 'conversation',
          autoArchiveDuration: 60,
          reason: 'New conversation started with ' + message.author.username,
        });
        await thread.members.add(message.author.id);
        console.log(`Created thread: ${thread.name}`);

        const isThreadCreationMessage = message.content.includes(`${persona} has created a thread:`);

        let response = isThreadCreationMessage ? '' : await openai.callopenai(message, message.author.username, persona);

        if (!message.author.bot && !isThreadCreationMessage) {
          const log = new Log({
            createdBy: persona,
            server: message.guild.name,
            channel: message.channel.name,
            sender: persona,
            receiver: message.author.username,
            message: response,
            time: new Date().toString()
          });
          log.save().then(() => {
            // console.log(`Message logged to MongoDB: ${persona}: ${response}\n`);
          }).catch(err => {
            console.error(err);
          });
        }
          setTimeout(() => {
            // Trim response if it's 2000 characters or more down to 1999 for Discord.
            if (response.length > 1999) {
              response = response.substring(0, 1999);
            }
            if (!isThreadCreationMessage) {
              thread.send(response);
            }
          }, 5000); // wait for 5 seconds before sending the response
          
          if (!isThreadCreationMessage) {
            const log = new Log({
              createdBy: persona,
              server: message.guild.name,
              channel: message.channel.name,
              sender: message.author.username,
              receiver: persona,
              message: message.content,
              time: new Date().toString()
            });
            log.save().then(() => {
          
            }).catch(err => {
              console.error(err); 
            });
          }
      }
    } catch (error) {
      console.error(error);
    }
  }
});







// Listens for DM's, Log the message and starts an OpenAI Dialogue
client.on('messageCreate', async function(message){
    if(message.channel.type === Discord.ChannelType.DM) {
        if(message.author.bot) return; 
            try {
                const log = new Log({
                    createdBy: persona,
                    server: "-",
                    channel: "directMessage",
                    sender: message.author.username,
                    receiver: persona,
                    message: message.content,
                    time: new Date().toString()
                });
                    log.save().then(() => {
                }).catch(err => {
                    console.error(err);
                });
                
    let response = await openai.callopenai(message, message.author.username, persona);
    console.log(`butler.js - Line 129 - ${message}, ${message.author.username}, ${persona}`);

    const log2 = new Log({
      createdBy: persona,
      server: "-",
      channel: "directMessage",
      sender: persona,
      receiver: message.author.username,
      message: response,
      time: new Date().toString()
    });
    log2.save().then(() => {
    }).catch(err => {
      console.error(err);
    });
    message.author.send(response);
  } catch (err) {
    console.error(err);
  }
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
        // console.log("Puerus starting here I hope!");
    } else
    if(message.content.startsWith(`/${slashPrefix}W`)) {
        console.log(`User: ${message.author.username} | Message: ${message.content}\n`);
        const weather = require('./utils.js');
        const OWMapiKey = process.env.OWMapiKey;
        const zip = message.content.split(' ')[1];
        if(!zip) {
        return message.channel.send("Please provide a zip code after the command")
        } else {
            let forecast = await weather.getWeather(zip, message, OWMapiKey, persona, message.author.username);
            console.log(`butler.js - Line 199 - ${forecast}`);
            let openForecast = await openai.callopenai(forecast, message.author.username, persona);
            console.log(`butler.js - Line 201 - ${openForecast}`);
            message.channel.send(openForecast);
            console.log(`butler.js - Line 129 - ${message}, ${message.author.username}, ${persona}`);

    }
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
//       if(minutesDiff > 360 ) {
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

console.log(`${persona} is online as of ${Date()}!\n`);

module.exports = client;