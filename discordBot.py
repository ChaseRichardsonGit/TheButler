import os
import openai
import discord
import re
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.environ.get("OPENAI_KEY")
DISCORD_BOT_TOKEN = os.environ.get("Puerus_TOKEN")
BOT_NAME = 'Puerus'

print("Initializing bot...")

intents = discord.Intents.default()
intents.typing = False
intents.presences = False
bot = commands.Bot(command_prefix='!', intents=intents) 

print("Bot initialized.")

print("Initializing OpenAI API...")
openai.api_key = OPENAI_API_KEY
print("OpenAI API initialized.")

async def generate_response(user_message):
    print("Generating response for user message:", user_message)
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": user_message},
    ]

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=500,
        n=1,
        stop=None,
        temperature=0.5,
    )

    result = response.choices[0].message['content'].strip()
    print("Generated response:", result)
    return result

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    # Split the message content into words and convert to lowercase
    words = [word.lower() for word in message.content.split()]

    # Check if the bot's name (in lowercase) is in the list of words
    if BOT_NAME.lower() in words:
        print("Detected bot name in message:", message.content)
        prompt = message.content
        response_text = await generate_response(prompt)
        print("Sending response to the message channel...")
        await message.channel.send(response_text)
        print("Response sent.")
    else:
        print("Bot name not detected in message:", message.content)

    await bot.process_commands(message)

if __name__ == "__main__":
    print("Starting the bot...")
    bot.run(DISCORD_BOT_TOKEN)