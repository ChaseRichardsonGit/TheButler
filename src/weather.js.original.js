require('dotenv').config(); 
const Discord = require('discord.js');

const http = require('http');

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


client.on('messageCreate', message => {
    if (message.content.startsWith('/weather')) {
        const zip = message.content.split(' ')[1];
        if(!zip) return message.author.send("Please provide a zip code after the command")
        const apiKey = '9e9d7905e130706d0ffc8a7d931cfd93';
        const options = {
            hostname: 'api.openweathermap.org',
            path: `/data/2.5/weather?zip=${zip}&appid=${apiKey}&units=imperial`,
            method: 'GET'
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                const weatherData = JSON.parse(data);
                if (res.statusCode === 200) {
                    // The request was successful
                    // You can access the weather data here
                    message.channel.send(`Weather in ${weatherData.name}`);
                    message.channel.send(`Temperature: ${weatherData.main.temp} F`);
                    message.channel.send(`Humidity: ${weatherData.main.humidity}%`);
                    message.channel.send(`Weather condition: ${weatherData.weather[0].description}`);
                } else if(res.statusCode === 400) {
                    // Handle Bad Request error
                    message.channel.send(`Error: Bad request, pleasecheck your input`);
                }else if(res.statusCode === 401) {
                    // Handle Unauthorized error
                    message.channel.send(`Error: Unauthorized, please check your API key`);
                }else if(res.statusCode === 404) {
                    // Handle Not Found error
                    message.channel.send(`Error: Not Found, please check your input`);
                }else if(res.statusCode === 429) {
                    // Handle Too Many Requests error
                    message.channel.send(`Error: Too Many Requests, please wait before making another request`);
                }else {
                    // Handle any other errors that may have occurred
                    message.channel.send(`Error: ${weatherData.message}`);
                }
            });
        });

        req.on('error', error => {
            message.channel.send(`Error: ${error.message}`);
        });

        req.end();
    }
});

client.login(process.env.DISCORD_TOKEN);