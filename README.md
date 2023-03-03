# The Butler
            To Install:
            git clone repo

            To run:
            node index.js Persona (where Persona = Butler, Jarvis, or Puerus)
                Only persona that spawns a webserver is Butler, J and P are Discord bots only.

            Scope & Approach:
            We want to create a Discord chatbot.  We want this bot to send a private message to new users with an introduction.
                - On Demand messaging through a command, time based messaging through timers, trigger based off criteria (user hasn't interacted in a day), Gauge and engage to gain sentiment. 
            We want the bot to be similar to a Butler.  
            We want this bot to be able to engage people in work.
            We want this bot to be able to manage karma.
            We want to include basic Discord functions like clearchat, release notes, server stats, and other basic Discord bot functions.
            We want DMs for OpenAI and conversation with the bot.  Main chat for / commands for interaction with the bot.

            MVP:(that we can show to someone)
            Welcome bot, execute / commands in main channel, conversational in DM + / commands, and creating the base persona of TheButler. 
            OpenAI DM integration with error catching, logging, scanback(10), and a way to make sure the conversation ends in a reasonable time.
            Trying to arm the bot with functions that expand its capability beyond OpenAI.  Feed Zip Temp API to OpenAI and get response.
            Log all 


            Requirements:
            Evolve past everyone talking in an open channel and move this to DM.
                Send message to new user or existing user you haven't interacted with in X hours "Hi, How are you today?"
                Send message "How are you feeling about the crypto market today?"
                Send message  
                This bot should be able to see every message in its DM history and respond individually.
            Add back the changelog as /changelog
            TheButler should have a /clearchat function that clears in increments of 100 based on user input
            It should include automod, auto-roles, Music, Moderation (voice and text), Logging, (ProBot) 
            It should be able to pull market graphs.  (AlphaBot?)
            It should have Polls (PollBot)
            It should integrate with OpenAI and OpenAssistant(https://github.com/LAION-AI/Open-Assistant/tree/main/discord-bot)
            It should have server stats and now playing.
            
            Direct Message Requirements and Implications
                - invoke the butler to start a direct message conversation through a command /BM (DM from the Butler)
                    - Could mean that the only place to interact with OpenAI (/BO) is in DM
                    - We're going to actively decide to start by making OpenAI the Butler BE OpenAI in this incarnation.
                        - Cost - DM's happening that you don't know about - need a dashbaord and our "EXPLORER" but need to manage the cost
                        - Code - Choosing whether to turn off the ability to use OpenAI in the main chat needs to be made so the code can be structured properly.
                    - How can I help you vs. How are you?
                        - Push - triggered or timed - How are you feeling?  Do you want to do some work?
                        - Pull - user instantiated - How can I help you? Here'es my menu of services.
                    - How does the conversation end in DM?
                        - Time Based?
                        - User initiated?
                        - Just wipe its memory (lobotomy) let messageData=()


            Foundational Approach:
            TheButler is the neocortex.  Everything is else a sub function or persona.
            TheButler is going to expand to a website in the future.
            TheButler will have multiple personas to 
            It would have integration with the blockchain.
                It should have Role Assignments based off of Wallet Addresses.  If you had land in your wallet and you attached your wallet to discord you would get a role in a channel.
                If they have our founders token they are admins on the channel and have access to OpenAI functionality.
                If they have our alpha token they are given the AlphaDog role.
                If they have our beta token they are given basic access to OpenAI functionality.
                If they have our free token, they receive a DM from the bot daily gauging sentiment on something.

            

            When someone posts a link with more than two reactions move/repost it to links for later channel. 
            User has been inactive for 24 hours, check in on them.

            Rename butler.js to discordbot.js
            Add total cost back in and make it work for web, just log it not show it on screen.
            Frontend Item - Username-input box floating down
            Post every link we write to the database goes to the links for later channel.
    

            Conversation History - Clear memory on timer?
            Track user and server stats and show them on a dashboard.
              Simple table dump list view at first
            Create a token count for how many OpenAI tokens are used by each user.
            Count total times a user has inteacted with OpenAI.
            Token limits?
            Collection at midnight of user message count for the day.
                 Users table, messages table
            Okay if users are manually populated
            Script a counter/timer when the clock strikes 00:00
            User, Post Count, last activity time
            Collect images and links/urls
                 Get list of users that haven't interacted in 7 days and give em a whaddup
            Build a bot.  Unleash it at the push of a button.

            Temperatures - Give each persona different personalities based on their temp.
                BlogBot - Creates blog articles for you based on a given subject?
                Melfi? - Weekly check in, scheduled appointment, Sundays at 10AM.
                GOD Bot - Kill all butlers, kill yourself, then start the butler.  Also where you summon the butler to your computer.
            Token Size
    
            Decision:  RIDAC
            TheButler will have certain core capabilities.  The personas will have sub-capabilities, but also the same features as TheButler.
            
            Topic of Discussion:
            DAO - 

            curl https://api.openai.com/v1/chat/completions
  -H "Authorization: Bearer $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"
  -H "Content-Type: application/json"
  -d '{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "What is the OpenAI mission?"}]
}'