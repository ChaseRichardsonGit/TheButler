// Get your persona from your environment otheriwse assume the butler
let whoami = process.argv[2];
if (whoami) {   
    let whoami = process.argv[2];
}
    else {  
    let whoami = 'butler';  
}

const { Configuration , OpenAIApi } = require('openai');

const calculateCost = require('./calccost.js');

const { getPersonaData, getChatLog, Cost, UserInfo } = require("./mongo.js");

const configuration = new Configuration({ 
    organization: process.env.OPENAI_ORG, 
    apiKey: process.env.OPENAI_KEY, 
});

const openai = new OpenAIApi(configuration); 

module.exports = { 
    callopenai: async function(message, sender, persona = whoami ) { 
        let previousMessages = await getChatLog(sender, persona).then(chatLog => { // 2.20.23-1017PM-Changed to persona from whoami
            let previousMessages = "";  
            for (let i = chatLog.length - 2; i >= chatLog.length - 10; i--) { 
                if (i < 0) {
                    break;
                }
                previousMessages += `${chatLog[i].sender}: ${chatLog[i].message}\n`;
            }
            //console.log(`previousMessages: ${previousMessages}`)
            return (previousMessages);
        });
       
        let preprompttext = await getPersonaData(persona).then(personaData => { 
            return (personaData.data);   
        });
       
         // OpenAI API call with try/catch
        try {
            const gptResponse = await openai.createCompletion({
                model: "text-davinci-003",
                prompt:  preprompttext + `${previousMessages} ${message.content}\n`,
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

            // Find the UserInfo in the database and update it with the cost
            // const userInfo = await UserInfo.findOne({ userId: message.author.id });
            // if (userInfo) {
            //     userInfo.cost_total += costTrimmed;
            //     userInfo.save().then(() => {
            //     }).catch(err => {
            //         console.error(err);
            //     });
            // }
            
            // Create a new Cost record and save it to the database
            // if(costTrimmed > 0.0001){
            //       const costRecord = new Cost({
            //         username: message.author.username,
            //         characters: response.length,
            //         tokens: total_tokens,
            //         cost: costTrimmed,
            //         time: new Date()
            //     });
    
            //     costRecord.save((error) => {
            //         if (error) {
            //             console.error("Error saving cost record: ", error);
            //         } 
            //     });
            // }

            if(response.length > 1999){
                response = response.substring(0, 1999);
            }
            return response;

        } catch (error) {
            console.error(`An error occurred while calling OpenAI API: ${error}`);
        }
    }
}