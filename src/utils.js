const { Cost, UserInfo } = require("./mongo.js");
const calculateCost = require('./calccost.js');
const openaiAPI = require("./openai.js");


async function updateUserInfo(message, costTrimmed) {
  // Find the UserInfo in the database and update it with the cost
  const userInfo = await UserInfo.findOne({ userId: message.author.id });
  if (userInfo) {
    userInfo.cost_total += costTrimmed;
    userInfo.save().then(() => {
    }).catch(err => {
      console.error(err);
    });
  }
}

function saveCostRecord(message, response, total_tokens, costTrimmed) {
  // Create a new Cost record and save it to the database
  if (costTrimmed > 0.0001) {
    const costRecord = new Cost({
      username: message.author.username,
      characters: response.length,
      tokens: total_tokens,
      cost: costTrimmed,
      time: new Date()
    });

    costRecord.save((error) => {
      if (error) {
        console.error("Error saving cost record: ", error);
      }
    });
  }
}

module.exports = {
  updateUserInfo,
  saveCostRecord,
};

const http = require('http');


module.exports = {getWeather: async function(zip, message, OWMapiKey, persona, username) {
    console.log(`utils.js - Line 46 - ${zip}, ${message}, ${OWMapiKey}, ${persona}, ${username}`);
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
                if(res.statusCode === 200) {
                    // The request was successful
                // let weather = `The weather in ${weatherData.name} is currently ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp} F which feels like ${weatherData.main.feels_like} F and a humidity of ${weatherData.main.humidity}%. The wind speed is ${weatherData.wind.speed} mph.  The forecast for the day is a high of ${weatherData.main.temp_max} F and a low of ${weatherData.main.temp_min} F.`;
                // // let weatherOut = openaiAPI.callopenai(`${weather}`, username, persona);
                // let weatherOut = openaiAPI.callopenai(`${weather}`, username, persona);
                // message.author.send(weatherOut);    
                message.author.send(`The weather in ${weatherData.name} is currently ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp} F which feels like ${weatherData.main.feels_like} F and a humidity of ${weatherData.main.humidity}%. The wind speed is ${weatherData.wind.speed} mph.  The forecast for the day is a high of ${weatherData.main.temp_max} F and a low of ${weatherData.main.temp_min} F.`);
                    // console.log(`utils.js - Line 66 - ${weather}, ${username}, ${persona}, ${weatherOut}`); 
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

