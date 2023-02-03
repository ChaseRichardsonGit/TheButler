const http = require('http');

module.exports = {
    getWeather: async function(zip, message, OWMapiKey) {
        const options = {
            hostname: 'api.openweathermap.org',
            path: `/data/2.5/weather?zip=${zip}&appid=${OWMapiKey}&units=imperial`,
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
                    message.author.send(`The weather in ${weatherData.name} is currently ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp} F which feels like ${weatherData.main.feels_like} F and a humidity of ${weatherData.main.humidity}%. The wind speed is ${weatherData.wind.speed} mph.  The forecast for the day is a high of ${weatherData.main.temp_max} F and a low of ${weatherData.main.temp_min} F.`);
                } else if(res.statusCode === 400) {
                    // Handle Bad Request error
                    message.channel.send(`Error: Bad request, please check your input`);
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
};