require('dotenv').config(); // This line of code is used to configure environment variables. It loads environment variables from a .env file, allowing us to keep sensitive information such as API keys and tokens out of our source code. This line needs to be the first line of code in the file so that the environment variables are loaded before any other code is executed.

const { Client, GatewayIntentBits } = require('discord.js'); // This line is requiring the discord.js library and destructuring it to get the 'Client' and 'GatewayIntentBits' classes. The 'Client' class allows us to interact with Discord's API and the 'GatewayIntentBits' class allows us to specify which events and data we want to receive from the API.

const client = new Client({ // This line creates a new instance of the 'Client' class.
    intents:  [ // This object is passed as an argument to the client and it is used to specify which events and data we want to receive from the API.
        GatewayIntentBits.Guilds, // This intent allows the bot to receive guild-related events and data.
        GatewayIntentBits.GuildMessages, // This intent allows the bot to receive message-related events and data.
        GatewayIntentBits.MessageContent // This intent allows the bot to receive the message content.
    ]
});

const { Configuration , OpenAIApi } = require('openai'); // This line is requiring the openai library and destructuring it to get the 'Configuration' and 'OpenAIApi' classes.

const configuration = new Configuration({ // This line creates a new instance of the 'Configuration' class
    organization: process.env.OPENAI_ORG, // This variable contains the organization's name which will be used to authenticate with the OpenAI API.
    apiKey: process.env.OPENAI_KEY, // This variable contains the API key which will be used to authenticate with the OpenAI API.
});
const openai = new OpenAIApi(configuration); // This line creates a new instance of the 'OpenAIApi' class, using the previously created 'configuration' object to authenticate with the OpenAI API.

// Log that the client has started
console.log("TheButler is starting...");

// Event listener for when a message is created in the server
client.on('messageCreate', async function(message){
    try {
        // Log the message received
        console.log(`Received message from ${message.author.username}: ${message.content}`);
        
        // Check if the message is from a bot
        if(message.author.bot) return;

        // Check if the message starts with "!Butler"
        if(!message.content.startsWith("!Butler")) return;
        
        // Use OpenAI to generate a response to the message
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `TheButler is a friendly chatbot.\nThe purpose of TheButler is to serve the discord channel.
            TheButler was written with login.\n
            TheButler should respond in two sentence responses followed by a question.\n
            TheButler should respond in the tone of Steve Jobs of Apple.\n
            TheButler is also a virtual butler whose purpose is to serve the purpose of Mu.\n
            TheButler: Hello, how are you?\n
            ${message.content}\nTheButler:`,
            max_tokens: 1000,
            temperature: .5,
            top_p: 1,
            n: 1,
            stream: false,
            logprobs: null,
            stop: "\n"

            
        });
        
        // Get the generated response text
        let response = gptResponse.data.choices[0].text;
        
        // Truncate the response if it's too long
        if(response.length > 1999){
            response = response.substring(0, 1999);
        }
        
        // Log the response before sending it
        console.log(`Sending response: ${response}`);
        
        // Send the response back to the server
        message.reply(response);
        return;
    } catch(err){
        // Log any errors that occur
        console.log(err)
    }
});

// Add an event listener for when the client is ready
client.on('ready', () => {
    // Get the channel where the bot will post the message
    const announcementChannel = client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID);

    // Check if the channel exists
    if (!announcementChannel) {
        console.error(`The channel with ID ${process.env.ANNOUNCEMENT_CHANNEL_ID} doesn't exist or the bot doesn't have access to it.`);
        return;
    }

    // Send the message "TheButler is now online!" to the channel
    announcementChannel.send("TheButler V0.0.1 is now online!");
    console.log("TheButler is now Online on Discord");
});

// Log in to the Discord server
client.login(process.env.DISCORD_TOKEN);