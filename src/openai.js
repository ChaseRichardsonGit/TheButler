// Get your persona from your environment otheriwse assume the butler
let persona = process.argv[2];
if (persona) {
  persona = process.argv[2];
} else {
  persona = 'Butler';
}

const { Configuration, OpenAIApi } = require('openai');

const axios = require('axios');

const { getPersonaData, getChatLog, Cost, UserInfo } = require('./mongo.js');
const { updateUserInfo, saveCostRecord } = require('./utils.js');


const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = { 
    callopenai: async function(message, sender, persona) { 
      console.log(`openai.js - Line 26 message: ${message} sender: ${sender} persona: ${persona}\n`);
  
      let chatLog = await getChatLog(sender, persona);
  
      // Reorder chat log in ascending order
      chatLog.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
      // Get the last 10 messages
      const lastMessages = chatLog.slice(-12);
  
      // Initialize userMessages and assistantMessages variables as empty strings
      let userMessages = "";
      let assistantMessages = "";
  
    //   console.log(`openai.js - Line 36 - getChatLog: sender: ${sender} persona: ${persona} lastMessages: ${lastMessages}`);
  
      for (let i = 0; i < lastMessages.length; i++) { 
        const message = `${lastMessages[i].sender}: ${lastMessages[i].message}`;
  
        if (message.startsWith(`${sender}:`)) {
            userMessages = message.replace(`${sender}: `, '') + '\n' + userMessages;
          } else if (message.startsWith(`${persona}:`)) {
            assistantMessages = message.replace(`${persona}: `, '') + '\n' + assistantMessages;
          }
        }
  
        console.log(` \x1b[33mopenai.js - Line 52 - User Messages:\x1b[0m \n${userMessages}`);
        console.log(` \x1b[33mopenai.js - Line 53 - Assistant Messages:\x1b[0m \n${assistantMessages}`);

        let preprompttext = await getPersonaData(persona).then(personaData => { 
            return (personaData);   
        });
            
        let max_tokens = 2000;
        let temperature = 0.5;

         // OpenAI API call
        try {
            // console.log(`openai.js - Line 57 - previousMessages: ${previousMessages}, preprompttext: ${preprompttext}, message: ${message}\n\n`);
            const gptResponse = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-0301",
                messages:[
                    {"role": "system", "content": `${preprompttext}`},
                    {"role": "user", "content": `${userMessages}`},
                    {"role": "assistant", "content": `${assistantMessages}`},
                    {"role": "user", "content": `${message}`},
                ],
                max_tokens: max_tokens,
                temperature: temperature,
                top_p: 1,
                n: 1,
                stream: false,
                // logprobs: null,
                stop: ""
            });          
            //  console.log(`openai.js - Line 112 - gptResponse: ${gptResponse.data.choices[0].message.content}\n\n`)
            let initResponse = gptResponse.data.choices[0].message.content;
            const regex = new RegExp(`^${persona}: (.*)`);
            const match = initResponse.match(regex);
            let response = initResponse;

            if (match) {
                // console.log(`openai.js - Line 62 - Regex: Match found`);
                const parsedData = match[1];
                response = parsedData;
            } else {
                response = initResponse;
                // console.log(`"Line 68 - openai.js - Regex: No match found"`);
            }

            // Calculate cost of response
            function calculateCost(total_tokens) {
                let cost_per_1000_tokens = 0.002;
                return (total_tokens/1000) * cost_per_1000_tokens;
            }

            let total_tokens = (gptResponse.data.usage.total_tokens);
            let prompt_tokens = (gptResponse.data.usage.prompt_tokens);
            let completion_tokens = (gptResponse.data.usage.completion_tokens);
            let cost = calculateCost(total_tokens);
            let costTrimmed = parseFloat(cost.toFixed(6));
            const lastMessagesString = lastMessages.map(message => `${message.sender}: ${message.message}`).join('\n');
            // Save cost record with lastMessagesString
            console.log(`\n\nopenai.js - Line 101 - \x1b[33mUsage Completion Tokens:\x1b[0m ${gptResponse.data.usage.completion_tokens}`)
            console.log(`openai.js - Line 102 - \x1b[33mUsage Prompt Tokens:\x1b[0m ${gptResponse.data.usage.prompt_tokens}`)
            console.log(`openai.js - Line 103 - \x1b[33mToken:${total_tokens}\x1b[0m,\x1b[32mTransCost:${costTrimmed}\x1b[0m`)
            
            // await updateUserInfo(sender, costTrimmed);
            await saveCostRecord(message, response, total_tokens, prompt_tokens, completion_tokens, max_tokens, temperature, costTrimmed, sender, persona, preprompttext, lastMessagesString );
            // console.log(`openai.js - Line 107 - \x1b[33mCost Record Saved\x1b[0m: Message: ${message} - Response: ${response} - Total Tokens: ${total_tokens} - Cost Trimmed: ${costTrimmed} - Sender: ${sender}`);
            
            return response;

          } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
          
            // Call the route to update history
            const historyUrl = `http://chat.chaserich.com:3001/api/history/${sender}/${persona}/2`;
            return axios.put(historyUrl)
              .then(response => {
                console.log(`\n\n\x1b[33mHistory update succeeded:\x1b[0m ${JSON.stringify(response.data)}\n\n`);
          
                // Retry OpenAI API call after history update
                return module.exports.callopenai(message, sender, persona)
                  .then(response => {
                    console.log(`\n\n\x1b [33mLine 130 - OpenAI API call succeeded:\x1b[0m ${response}\n\n`);
                    return response;
                  })
                  .catch(error => {
                    console.error(`An error occurred while calling OpenAI API: ${error}`);
                    return "I'm sorry it seems an error occured while calling OpenAI, please try again.";
                  });
              })
              .catch(error => {
                console.error(`Failed to update history: ${error}`);
                return "I'm sorry it seems an error occured while updating history, please try again.";
              });
          }
    }
  }
  