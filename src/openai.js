// Get your persona from your environment otheriwse assume the butler
let persona = process.argv[2];
if (persona) {
  persona = process.argv[2];
} else {
  persona = 'Butler';
}

const { Configuration, OpenAIApi } = require('openai');

const { getPersonaData, getChatLog, Cost, UserInfo } = require('./mongo.js');

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = { 
    callopenai: async function(message, sender, persona) { 
      console.log(`openai.js - Line 22 - message: ${message} sender: ${sender} persona: ${persona}\n`);
  
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
  
        console.log(`openai.js - Line 48 - User Messages:\n${userMessages}`);
        console.log(`openai.js - Line 49 - Assistant Messages:\n${assistantMessages}`);

        let preprompttext = await getPersonaData(persona).then(personaData => { 
            return (personaData);   
        });
   
         // OpenAI API call
        try {
            // console.log(`openai.js - Line 100 - previousMessages: ${previousMessages}, preprompttext: ${preprompttext}, message: ${message}\n\n`);
            const gptResponse = await openai.createChatCompletion({
                model: "gpt-3.5-turbo-0301",
                messages:[
                    {"role": "system", "content": `${preprompttext}`},
                    {"role": "user", "content": `${userMessages}`},
                    {"role": "assistant", "content": `${assistantMessages}`},
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