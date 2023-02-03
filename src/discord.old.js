const Discord = require("discord.js");
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Log } = require("./mongo");

const client = new Client({
intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages,
],
partials: [Partials.Channel, Partials.Message, Partials.User,]
});

client.on("messageCreate", async message => {
const log = new Log({
    server: message.guild.name,
    channel: message.channel.name,
    username: message.author.username,
    message: message.content,
    time: new Date().toString()
});

log.save().then(() => {
console.log("Message logged to MongoDB");
}).catch(err => {
console.error(err);
});
});

module.exports = client;