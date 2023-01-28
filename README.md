# The Butler

            Scope & Approach:
            We want to create a Discord chatbot.  We want this bot to send a private message to new users with an introduction.
                - On Demand messaging through a command, time based messaging through timers, trigger based off criteria (user hasn't interacted in a day), Gauge and engage to gain sentiment. 
            We want the bot to be similar to a Butler.  
            We want this bot to be able to engage people in work.
            We want this bot to be able to manage karma.
            We want to include basic Discord functions like clearchat, release notes, server stats, and other basic Discord bot functions.
            We want DMs for OpenAI and conversation with the bot.  Main chat for / commands for interaction with the bot.

            MVP:(that we can show to someone)
            Welcomes bot, execute / commands in main channel, conversational in DM + / commands, and creating the base persona of TheButler. 
            OpenAI DM integration with error catching, logging, scanback(10), and a way to make sure the conversation ends in a reasonable time.
            Trying to arm the bot with functions that expand its capability beyond OpenAI.  Feed Zip Temp API to OpenAI and get response.


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

            Dashboard / Explorer (Sounds like a Telemetry and Jarvis but it's core)
                - Concept of a cost dashbaord + pulse of the hive
                - Could include logs and errors


            Karma System:
                - Stampy as an example gives lots of paths to explore 
                - more here later
            


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
                
            
            
            Decision:  RIDAC
            TheButler will have certain core capabilities.  The personas will have sub-capabilities, but also the same features as TheButler.
            
            
            
            Topic of Discussion:
            DAO - 


            
        
