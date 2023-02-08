const { Configuration , OpenAIApi } = require('openai');

const calculateCost = require('./calccost.js');

const { getPersonaData, getChatLog, Cost, UserInfo } = require("./mongo.js");

const configuration = new Configuration({ 
    organization: process.env.OPENAI_ORG, 
    apiKey: process.env.OPENAI_KEY, 
});

const openai = new OpenAIApi(configuration); 

module.exports = { 
    callopenai: async function(message) {
        console.log(`FromModule: openai-upper`);
        console.log(`message: ${message}`);
        console.log(`message.author: ${message.author}`);
        console.log(`message.author.username: ${message.author.username}`);
        console.log(`message.content: ${message.content}\n`);
        
        // Get previous messages from mongo
        let previousMessages = await getChatLog(message.author.username, process.env.WHOAMI).then(chatLog => { 
            let previousMessages = "";
            for (let i = chatLog.length - 2; i >= chatLog.length - 5; i--) { 
                if (i < 0) {
                    break;
                }
                previousMessages += `${chatLog[i].message}\n`;
            }
//            console.log(`previousMessages: ${previousMessages}`)
            return (previousMessages);
        });

        // Get preprompt text from mongo for Persona
        let preprompttext = await getPersonaData(process.env.WHOAMI).then(personaData => { 
            return (personaData.data);   
        });
       
         // OpenAI API call with try/catch
        try {
            const gptResponse = await openai.createCompletion({
                model: "text-davinci-003",
                prompt:  preprompttext + `${previousMessages} \n`,
                max_tokens: 2000,
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
//            console.log(`${preprompttext} \n ${previousMessages} \n ${message.content}\n`);

            // Find the UserInfo in the database and update it with the cost
            const userInfo = await UserInfo.findOne({ userId: message.author.id });
            if (userInfo) {
                userInfo.cost_total += costTrimmed;
                userInfo.save().then(() => {
                    console.log(`UserInfo updated for user ${message.author.username} with cost_total: ${userInfo.cost_total}\n`);
                }).catch(err => {
                    console.error(err);
                });
            }
            
            // Create a new Cost record and save it to the database
            if(costTrimmed > 0.0001){
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
                    } else {
                        console.log("Cost record saved successfully.");
                    }
                });
            }

            if(response.length > 1999){
                response = response.substring(0, 1999);
            }
            
            message.author.send(response);

        } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
        }
    }
}

