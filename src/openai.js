// Get your persona from your environment otheriwse assume the butler
let persona = process.argv[2];
if (persona) { persona = process.argv[2];
} else { persona = 'Butler'; }

const { Configuration , OpenAIApi } = require('openai');

//const calculateCost = require('./calccost.js');
//const { updateUserInfo, saveCostRecord } = require('./utils.js');

const { getPersonaData, getChatLog, Cost, UserInfo } = require("./mongo.js");

const configuration = new Configuration({ 
    organization: process.env.OPENAI_ORG, 
    apiKey: process.env.OPENAI_KEY, 
});

const openai = new OpenAIApi(configuration); 

module.exports = { 
    callopenai: async function(message, sender, persona ) { 
        console.log(`openai.js - Line 22 - message: ${message} sender: ${sender} persona: ${persona}`)
        let previousMessages = await getChatLog(sender, persona).then(chatLog => { // 2.20.23-1017PM-Changed to persona from whoami
            console.log(`openai.js - Line 24 - getChatLog: sender: ${sender} persona: ${persona}`)
            let previousMessages = "";  
            for (let i = chatLog.length - 2; i >= chatLog.length - 10; i--) { 
                if (i < 0) {
                    break;
                }
                previousMessages += `${chatLog[i].sender}: ${chatLog[i].message}\n`;
            }
            // console.log(`openai.js - Line 30 - previousMessages: ${previousMessages}`)
            return (previousMessages);
        });
       
        let preprompttext = await getPersonaData(persona).then(personaData => { 
            return (personaData.data);   
        });
        // console.log(`openai.js - Line 37 - persona: ${persona}`);
        // console.log(`openai.js - Line 38 - preprompttext: ${preprompttext}`);
       
         // OpenAI API call
        try {
            const gptResponse = await openai.createCompletion({
                model: "text-davinci-003",
                prompt:  preprompttext + `${previousMessages} ${message}\n`,
                max_tokens: 2000,
                temperature: .5,
                top_p: 1,
                n: 1,
                stream: false,
                logprobs: null,
                stop: ""
            });          
            
            let initResponse = gptResponse.data.choices[0].text.trim(); 
            const regex = new RegExp(`^${persona}: (.*)`);
            const match = initResponse.match(regex);
            // console.log(`openai.js - Line 58 - initResponse: ${initResponse}`)
            let response = initResponse;

            if (match) {
                console.log(`openai.js - Line 62 - Regex: Match found`);
                const parsedData = match[1];
                // console.log(`openai.js - Line 63 - parsedData: ${parsedData}`)
                response = parsedData;
                // console.log(`openai.js - Line 65 - response: ${response}`);
            } else {
                response = initResponse;
                console.log(`"Line 68 - openai.js - Regex: No match found"`);
              }
            
            if(response.length > 1999){
                response = response.substring(0, 1999);
            }
            // console.log(`openai.js - Line 72 - response: ${response}`);
            return response;

        } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
        }
    }
}

            // let total_tokens = (gptResponse.data.usage.total_tokens);
            // let cost = calculateCost.calculateCost(total_tokens);
            // let costTrimmed = parseFloat(cost.toFixed(4));
            // updateUserInfo(message, costTrimmed);
            // saveCostRecord(message, response, total_tokens, costTrimmed);   