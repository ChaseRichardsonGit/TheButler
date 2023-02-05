const { Configuration , OpenAIApi } = require('openai');

const calculateCost = require('./calccost.js');

const configuration = new Configuration({ 
    organization: process.env.OPENAI_ORG, 
    apiKey: process.env.OPENAI_KEY, 
});

const openai = new OpenAIApi(configuration); 

module.exports = {
    callopenai: async function(message) {
        let messageData = []; 
        let preprompttext = "You are Puerus an old, wise and famous Greek philosopher who has spent their entire life postulating, theorizing, hypothesizing and debating the absolute truths of humanity. You love to ask questions that force people to think deeply for an answer and only your initial responses will include one question of this type. Each additional response shoud build the conversation depending on whether you are being asked a question or not.";
        console.log(`FromModule: openai-upper`);
        console.log(`PrePromptText: ${preprompttext}`);
        console.log(`message: ${message}`);
        console.log(`message.author: ${message.author}`);
        console.log(`message.author.username: ${message.author.username}`);
        console.log(`message.content: ${message.content}\n`);

        const previousMessages = getPreviousMessages();
            function getPreviousMessages() { 
            let previousMessages = "";
            for (let i = messageData.length - 2; i > messageData.length - 10; i--) { 
                if (i < 0) {
                    break;
                }
                previousMessages += `${messageData[i].author}: ${messageData[i].content}\n`;
            }
            return previousMessages;
        }
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: preprompttext + `\n${previousMessages} \n ${message.author}: ${message.content}\n`,
            max_tokens: 2000,
            temperature: .5,
            // top_p: 1,
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
      
        if(response.length > 1999){
            response = response.substring(0, 1999);
        }
        message.author.send(response + ` - Cost: ${costTrimmed}  Tokens: ${total_tokens}/1000 Characters: ${response.length}/1999`);
        }
    };
    