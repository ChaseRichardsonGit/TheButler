# The Butler
            To Install:
            git clone repo

            To run:
            node index.js Persona (where Persona = Butler, Jarvis, or Puerus)
                Only person that spawns a webserver is Butler, J and P are Discord bots only.



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

            **TheButler to start Puerus.  Send a slash command to TheButler to start or stop the bots.
            
            0.084 Backlog:
            Javascript code with a timer that looks up last bot that said something and say something back. doesn't use on message command.
                After 5 minutes have elapsed, do a for loop.  Look up the last message in a channel from a bot or human, message bot after timer has elapsed.
            TheButler should orient you.  It will welcome you in the channel but also send you a DM.  Or start a thread in the server.
            Set a ratelimit.  You get 10 questions per hour.  Think of a genie with 3 wishes.  Create scarcity.

            Summarization - Summarize the weather.  Feed our owm response to openai and have it feed back as a flamboyantly gay chicago weatherman.
            Metaprompting - Have TheButler scanback 20 messages or 5 minutes and interject accordingly.  To see if it can be conversational in context.

            When someone posts a link with more than two reactions move/repost it to links for later channel. 
            User has been inactive for 24 hours, check in on them.

            2.12.23 Work List:
            Backend:
            Starting it with a parameter.  -- DONE -- Seneca -- 2/23/23
            Get regex parsing working.  Even if triplicated.  Parse it going into the DB and not on the way out.  -- DONE -- 2/24/23 - 8PM
            Clean up node-modules and package.json    -- DONE -- REDO
            Add feature for timer to be smarter.  It should not fire if the last message was from any bot.  
                Extend the timer to private channel.
                Botpacalypse - Start for 5 minutes.
            Listening for their name in all channels.  -- DONE

            Frontend:
            Username input on mobile.  - Mostly done
            
            Structure Changes:
            If you provide matching discord name your conversation history pops up (nice name) | DONE 

            2/18/23 Idea list:
            Chat History (by username)  --  DONE
            Lifecycle of conversation (when does it start and stop)
            "New Conversation" button? / Discord /reset? (group by day?)
            Add a Discord link to Mu?


            Known Bugs / Issues
            PERSONAS ON WEB  -- DONE -- 2/26/23 - 3:09PM
            Double logging the users messages. 2/26/23 - 1010AM  -- FIXED - 2:15PM
            Load chathistory logs. 2/26/23 - 1013AM  -- FIXED - 2:15PM
            Fix username-input text color to Black - DONE - 2/22/23 - 11:45AM
            It doesn't answer the first question right on Web. - Solved/not fixed - First message not saving to DB  - DONE - 2/26/23 - 3PM
              Discord replies with new lines but webchat doesn't.  -- FIXED -- 2/26/23

            /Commands out of the butler 
            userInfo/calc/cost/clear into utils.
          
         
            0.0.897 Punch List:
            Remove all whoami where possible and replace with persona -- DONE -- ?  
            Capture DM's sent count to bots in userInfos for tracking. -- DONE -- 
            Get rid of puerus.js and jarvis.js by changing index.js - DONE - 2/23 - 8PM
            Rename butler.js to discordbot.js
            Add total cost back in and make it work for web, just log it not show it on screen.
            Frontend Item - Username-input box floating down
            Post every link we write to the database goes to the links for later channel.
    


            BIG WANT for 0.0.9 - Weather through OpenAI and Jawnbot
            Finish passing the weather through openai and return longform response.
            Website to be live to the database with ajax polling 1s.
            Expose weather on the web.
            Slash commands on web?
            Today's Chats.
            Conversation History - Clear memory on timer?


            0.0.9 Wish List:
            All the styling!
                Send button changed to little blue pointer telegram arrow thingy inside of input box - Done - 10AM
                Submit button for username inside of username-input - Done - 1010AM
                Left side padding for search bar - Added, need feedback - 1013AM
                Chatbubbles only as large as the text? -- Worked on from 11:30AM-12:30AM, almost there but went back to full size.  Look in style.css .message 
                Username fit in header on mobile.
                Change username-input size for web and mobile.

            When persona is changed, clear chat window, then load chat history with user.
            In webserver.js - Fix getPersona mongo client to use our client
            Use ajax to get messages in realtime. - 1s polling

            Move regex into OpenAI.js | parse response out | DONE! - 2/23 - 7:31PM

            0.1.0 Wishlist:
            A way to update the prompts for the persona's easily.
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
            
            

            Three Bots:
            TheButler - Simplified code + mongoose.
            Puerus - A side bot.
            Jarvis - B side bot.

            
            Decision:  RIDAC
            TheButler will have certain core capabilities.  The personas will have sub-capabilities, but also the same features as TheButler.
            
            
            
            Topic of Discussion:
            DAO - 


            
        
