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

module.exports = {
  getWeather: async function(zip, message, OWMapiKey, persona, username) {
    return new Promise((resolve, reject) => {
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
            const forecast = `If you are given a weather forecast, pretend that you're a weatherman and make sure you deliver the weather using your normal slang and vocabulary but also in long weatherman form using specifics from the data you were provided.  You should reply in two paragraphs. The weather in ${weatherData.name} is currently ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp} F which feels like ${weatherData.main.feels_like} F and a humidity of ${weatherData.main.humidity}%. The wind speed is ${weatherData.wind.speed} mph.  The forecast for the day is a high of ${weatherData.main.temp_max} F and a low of ${weatherData.main.temp_min} F.`; 
            resolve(forecast);
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}`));
          }
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.end();
    });
  }
};
