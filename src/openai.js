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
        console.log(`openai.js - Line 22 - message: ${message} sender: ${sender} persona: ${persona}\n`)
        let previousMessages = await getChatLog(sender, persona).then(chatLog => { 
            console.log(`openai.js - Line 24 - getChatLog: sender: ${sender} persona: ${persona}`)
            let previousMessages = "";  
            for (let i = chatLog.length - 2; i >= chatLog.length - 10; i--) { 
                if (i < 0) {
                    break;
                }
                previousMessages += `${chatLog[i].sender}: ${chatLog[i].message}\n`;
            }
            console.log(`openai.js - Line 32 - previousMessages: ${previousMessages}\n\n\n`)
            return (previousMessages);
        });
       
        let preprompttext = await getPersonaData(persona).then(personaData => { 
            return (personaData);   
        });

        // console.log(`openai.js - Line 40 - persona: ${persona}`);
        // console.log(`openai.js - Line 41 - preprompttext: ${preprompttext}`);
       
         // OpenAI API call
        try {
            console.log(`openai.js - Line 45 - previousMessages: ${previousMessages}, preprompttext: ${preprompttext}, message: ${message}\n\n`);
            const gptResponse = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-0301",
                messages:[
                    {"role": "system", "content": `${preprompttext}`},
                    {"role": "user", "content": `${previousMessages}`},
                    {"role": "assistant", "content": ``},
                    {"role": "user", "content": `${message}`},
                ],
                max_tokens: 2000,
                temperature: 0.5,
                top_p: 1,
                n: 1,
                stream: false,
                // logprobs: null,
                stop: ""
            });          
            console.log(`openai.js - Line 62 - gptResponse: ${gptResponse.data.choices[0].message.content}\n\n`)
            let initResponse = gptResponse.data.choices[0].message.content;
///////////

            //     console.log(`openai.js - Line 69 - previousMessages: ${previousMessages}, preprompttext: ${preprompttext}, message: ${message}`);
            //     const gptResponse = await openai.createCompletion({
            //     model: "text-davinci-003",
            //     prompt:  preprompttext + `${previousMessages} ${message}\n`,
            //     max_tokens: 2000,
            //     temperature: 0.5,
            //     top_p: 1,
            //     n: 1,
            //     stream: false,
            //     logprobs: null,
            //     stop: ""
            // });          
            // // console.log(`openai.js - Line 81 - gptResponse: ${gptResponse.data.choices[0].message.content}`)
            // let initResponse = gptResponse.data.choices[0].text.trim(); 

/////////////


            const regex = new RegExp(`^${persona}: (.*)`);
            const match = initResponse.match(regex);
            // console.log(`openai.js - Line 58 - initResponse: ${initResponse}`)
            let response = initResponse;

            if (match) {
                // console.log(`openai.js - Line 62 - Regex: Match found`);
                const parsedData = match[1];
                // console.log(`openai.js - Line 63 - parsedData: ${parsedData}`)
                response = parsedData;
                // console.log(`openai.js - Line 65 - response: ${response}`);
            } else {
                response = initResponse;
                // console.log(`"Line 68 - openai.js - Regex: No match found"`);
            }
            
            if(response.length > 1999){
                response = response.substring(0, 1999);
            }
            // console.log(`openai.js - Line 72 - response: ${response}`);
            return response;

        } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
            return "I'm sorry it seems an error occured, please try again.";
          }
    }
}



            // let total_tokens = (gptResponse.data.usage.total_tokens);
            // let cost = calculateCost.calculateCost(total_tokens);
            // let costTrimmed = parseFloat(cost.toFixed(4));
            // updateUserInfo(message, costTrimmed);
            // saveCostRecord(message, response, total_tokens, costTrimmed);   