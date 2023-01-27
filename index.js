require('dotenv').config(); 
const weather = require('./src/weather.js');
const calculateCost = require('./src/calccost.js');
const OWMapiKey = process.env.OWMapiKey;

const fs = require('fs');

const Discord = require('discord.js');

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
    });

client.on('messageCreate', async function(message){
  if(message.channel.type === Discord.ChannelType.DM) {
    let now = new Date();
    fs.appendFileSync('logs/openai.log', `[${now.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${message.author.username}: ${message.content}\n`);
    }
    });

client.on("messageCreate", async function(message){
  if(message.author.bot) return;
  if (message.content.startsWith('/weather')) {
    const zip = message.content.split(' ')[1];
    if(!zip) return message.channel.send("Please provide a zip code after the command")
    weather.getWeather(zip, message, OWMapiKey);
} else   
  if(message.channel.type === Discord.ChannelType.DM) {
    console.log("Received a direct message from " + message.author.username + ": " + message.content);   
    try {
      const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `\n${message.author.username}: ${message.content}\n`,
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
      if(response.length > 1999){
        response = response.substring(0, 1999);
      }
      message.author.send(response + ` - Cost: ${costTrimmed}  Tokens: ${total_tokens}`);
    } catch (error) {
      console.error(error);
    } 
  } else {
    return;
  }
});
client.login(process.env.DISCORD_TOKEN);