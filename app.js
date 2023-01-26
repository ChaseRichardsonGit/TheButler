require('dotenv').config(); 

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

client.on("messageCreate", async function(message){
    if (message.channel.type === Discord.ChannelType.DM && !message.author.bot) {
        console.log("We received a DM from " + message.author.username + ": " + message.content);
    }
    if (message.channel.type === Discord.ChannelType.DM && message.content === '/hello'){
        message.author.send('Hello!  You can ask me questions with /q followed by your prompt!');
    }
});

client.login(process.env.DISCORD_TOKEN);