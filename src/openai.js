const { Configuration , OpenAIApi } = require('openai');

const calculateCost = require('./calccost.js');

const { getPersonaData } = require("./mongo.js");

const { getChatLog } = require("./mongo.js");

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
                prompt:  preprompttext + `${previousMessages} \n ${message.author}: ${message.content}\n`,
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
            console.log(`\x1b[33mToken:${total_tokens}\x1b[0m,\x1b[32mTransCost:${costTrimmed}\x1b[0m`);
            console.log(`PrePromptText: ${preprompttext}`);
            console.log(`PreviousMessages: ${previousMessages}`);
            console.log(`message: ${message}`);
            console.log(`message.author: ${message.author}`);
            console.log(`message.author.username: ${message.author.username}`);
            console.log(`message.content: ${message.content}\n`);
          
            if(response.length > 1950){
                response = response.substring(0, 1950);
            }
//           message.author.send(response + ` - Cost: ${costTrimmed}  Tokens: ${total_tokens}/1000 Characters: ${response.length}/1999`);
             message.author.send(response);
        } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
        }
    }
}

