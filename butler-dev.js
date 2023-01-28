require('dotenv').config(); 
const Discord = require('discord.js');
const fs = require('fs');
const OWMapiKey = process.env.OWMapiKey;
const weather = require('./src/weather.js');
const calculateCost = require('./src/calccost.js');
const clearchat = require('./src/clearchat');
const butlerText = fs.readFileSync('./src/butler.txt', 'utf8');
const jarvisText = fs.readFileSync('./src/jarvis.txt', 'utf8');
const psychText = fs.readFileSync('./src/psych.txt', 'utf8');
const sleepText = fs.readFileSync('./src/sleep.txt', 'utf8');

const { Client, GatewayIntentBits, Partials } = require('discord.js');

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

const { Configuration , OpenAIApi } = require('openai');

const configuration = new Configuration({ 
    organization: process.env.OPENAI_ORG, 
    apiKey: process.env.OPENAI_KEY, 
});

const openai = new OpenAIApi(configuration); 

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const announcementChannel = client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID);

  if (!announcementChannel) {
      console.error(`The channel with ID ${process.env.ANNOUNCEMENT_CHANNEL_ID} doesn't exist or the bot doesn't have access to it.`);
      return;
  }

  announcementChannel.send(`TheButler Dev is now online!  Interact with /weather zip or by DM'ing me!`);
});
    

client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
    let now = new Date();
    fs.appendFileSync('logs/openai.log', `[${now.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${message.author.username}: ${message.content}\n`);
    }
    });

let messageData = []; 
let timeoutId;

client.on("guildMemberAdd", (member) => {
  const welcomeChannel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID);

  if (!welcomeChannel) {
    console.error(`The channel with ID ${process.env.WELCOME_CHANNEL_ID} doesn't exist or the bot doesn't have access to it.`);
    return;
  }
  welcomeChannel.send(`Welcome ${member.user.username} to the server!`);
  console.log(`Welcome ${member.user.username} to the server!`);
});
let preprompttext = butlerText;

client.on("messageCreate", async function(message){
  if(message.author.bot) return;
  if(message.content.startsWith("/clearchat")) {
    clearchat(message); return;
  } else
  if(message.content.startsWith('/weather')) {
    const zip = message.content.split(' ')[1];
    if(!zip) return message.channel.send("Please provide a zip code after the command")
    weather.getWeather(zip, message, OWMapiKey);
} else 
  if(message.content.startsWith("/j")) {
  preprompttext = butlerText + jarvisText;  
  }
  if(message.content.startsWith("/p")) {
    preprompttext = butlerText + psychText;  
    }
  if(message.content.startsWith("/s")) {
    preprompttext = butlerText + sleepText;  
    }          
  if(message.channel.type === Discord.ChannelType.DM) {
    console.log("Received a direct message from " + message.author.username + ": " + message.content);   

    messageData.push({author: message.author.username, content: message.content});
    const previousMessages = getPreviousMessages();

    function getPreviousMessages() { 
      let previousMessages = "";
      for (let i = messageData.length - 2; i > messageData.length - 10; i--) { 
          if (i < 0) {
              break;
          }
          previousMessages += `${messageData[i].author}: ${messageData[i].content}\n`;
      }
      return previousMessages;
  }   
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        messageData = [];
        console.log("\x1b[33mCleared message data\x1b[0m") 
      }, 30000);   
      

    try {
      const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: preprompttext + `\n${previousMessages} \n  ${message.content}\n`,
        max_tokens: 1000,
        temperature: .5,
        top_p: 1,
        n: 1,
        stream: false,
        logprobs: null,
        stop: ""
      });

      let response = gptResponse.data.choices[0].text.trim(); 
      let total_tokens = (gptResponse.data.usage.total_tokens);
      let cost = calculateCost.calculateCost(total_tokens);
      let costTrimmed = parseFloat(cost.toFixed(4));
      console.log(`\x1b[33mToken:${total_tokens}\x1b[0m,\x1b[32mTransCost:${costTrimmed}\x1b[0m`)
      console.log(`PreviousMessages: ${previousMessages} \n  message.author.username : ${message.author.username}\n Message Content : ${message.content}\n Text: ${preprompttext}`)
      if(response.length > 1999){
        response = response.substring(0, 1999);
      }
      message.author.send(response + ` - Cost: ${costTrimmed}  Tokens: ${total_tokens}/1000`);
    } catch (error) {
      console.error(error);
    } 
  } else {
    return;
  }
});
client.login(process.env.DISCORD_TOKEN);