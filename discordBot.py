# %pip install -q -U openai
import os
import openai
import discord
from discord.ext import commands
# Set your bot's token and OpenAI API key
DISCORD_BOT_TOKEN = 'MTA2OTM4MTI0MDg0ODkyNDc5Mw.GHrVT2.Sbgf-UvqDnijKDTaM--DZTxTIrC_lvyWq1HkYE'
OPENAI_API_KEY = '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'
# Set your bot's name
BOT_NAME = 'God'
# Initialize the bot
intents = discord.Intents.default()
intents.typing = False
intents.presences = False
bot = commands.Bot(command_prefix='!', intents=intents)
# Initialize OpenAI API
openai.api_key = OPENAI_API_KEY
# Function to Generate a Response from OpenAI
async def generate_response(prompt):
    response = openai.Completion.create(
        model='davinci-codex',
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.5
    )
    return response.choices[0].text.strip()
# Announce when the bot is ready
@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
# Listen for messages and respond with OpenAI
@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    if BOT_NAME.lower() in message.content.lower():
        prompt = f"{message.author.name}: {message.content}"
        response_text = await generate_response(prompt)
        await message.channel.send(response_text)

    await bot.process_commands(message)
# Start the bot
if __name__ == "__main__":
    bot.run(DISCORD_BOT_TOKEN)