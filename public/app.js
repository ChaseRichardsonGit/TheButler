const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');
const usernameInput = document.querySelector('#username-input');
const usernameSubmitButton = document.querySelector('#username-submit-button');
const clearButton = document.querySelector('#clear-btn');
const converter = new showdown.Converter();

let username = '';

// Username Submit listener to load chat history
usernameSubmitButton.addEventListener('click', async () => {
  username = usernameInput.value.trim();
  if (username) {
    usernameInput.value = '';
    usernameInput.disabled = true;
    usernameSubmitButton.disabled = true;
    const usernameContainer = document.getElementById('username-container');
    usernameContainer.innerHTML = `${username}`;

    try {
      const chatHistory = await $.ajax({
        url: '/api/chat-history',
        type: 'POST',
        data: {
          username,
          selectedPersona,
          messageType: "history",
        },
      });
  
      // Add chat history to the chat window
      for (const message of chatHistory) {
        addMessage(
          message.sender,
          message.message,
          message.selectedPersona,
          message.response,
          message.time,
          "history"
        );
      }
   
      // console.log('Chat history loaded successfully' + chatHistory)
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
}});

// Username listener for enter key
usernameInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    usernameSubmitButton.click();
  }
});

// User input listener for enter key
userInput.addEventListener('keyup', (event) => {
  event.preventDefault();
  if (event.keyCode === 13) {
    sendButton.click();
  }
});

// Dropdown personas
const dropdown = document.createElement('select');
  dropdown.id = 'persona-dropdown';
  dropdown.addEventListener('change', (event) => {
  selectedPersona = event.target.value;
});

const personaDropdown = document.querySelector('#persona-dropdown');
let selectedPersona = '';
personaDropdown.addEventListener('change', async (event) => {
  selectedPersona = event.target.value;
  const headerFrame = document.getElementById('header-frame');
  const personaImage = document.getElementById('persona-image');

  if (selectedPersona === 'Puerus') {
    personaImage.src = '/img/Puerus.png';
  } else if (selectedPersona === 'Jarvis') {
    personaImage.src = '/img/Jarvis.png';
  } else if (selectedPersona === 'Butler') {
    personaImage.src = '/img/Butler.png';
  } else if (selectedPersona === 'Melfi') {
    personaImage.src = '/img/Melfi.png';
  } else if (selectedPersona === 'Deadass') {
    personaImage.src = '/img/Deadass.png';    
  } else {
    headerFrame.style.backgroundColor = '#1d1d1d';
    personaImage.src = '/img/Butler.png';
  }

  try {
    const chatHistory = await $.ajax({
      url: '/api/chat-history',
      type: 'POST',
      data: {
        username,
        selectedPersona,
        messageType: "history",
      },
    });
    
    // Clear the chat window
    chatWindow.innerHTML = '';

    // Add chat history to the chat window
    for (const message of chatHistory) {
      addMessage(
        message.sender,
        message.message,
        message.selectedPersona,
        message.response,
        message.time,
        "history",
      );
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
});

// userInfo Updates
// import { updateUserInfo, UserInfo } from '..src\mongo.js';


// addMessage function
async function addMessage(sender, message, selectedPersona, response, messageType = '') {
  const timestamp = Date.now();
  const div = document.createElement('div');
  let senderName = sender;

  if (!sender) {
    senderName = 'anonymous';
  } else if (sender === 'bot') {
    senderName = selectedPersona;
    div.classList.add('bot');
  }

  div.className = `message ${senderName}`;

  if (sender === username) {
    div.classList.add('user');
  } else if (sender === 'bot') {
    div.classList.add('bot');
    div.classList.add(selectedPersona.toLowerCase());
  }

  // Convert message from Markdown to HTML using Showdown
  const html = converter.makeHtml(message);
  div.innerHTML = `<div style="display: inline">${senderName}: </div>${html}<br>`;

  if (response) {
    const botMessage = document.createElement('div');
    botMessage.className = `message bot ${selectedPersona.toLowerCase()}`;
    // Convert response from Markdown to HTML using Showdown
    const responseHtml = converter.makeHtml(response);
    botMessage.innerHTML = `${selectedPersona}: ${responseHtml}<br>`;
    chatWindow.appendChild(botMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  if (sender === username && (messageType === 'sent' || messageType === 'received')) {
    $.ajax({
      url: '/api/save-message',
      type: 'POST',
      data: {
        username,
        message,
        timestamp,
        persona: selectedPersona,
        sender
      }
    })
      .done((response) => {
        // console.log('Message saved to database:', response);

        const message = {
          guild: { name: "web" },
          author: { id: username }
        };
        
        updateUserInfo(message);
        console.log('app.js - Line 188 - User info updated:', UserInfo)
      })
      .fail((error) => {
        console.error('Error saving message to database:', error);
        console.log('app.js - Line 192 - User info updated:', UserInfo)
      });
  }
}

// Send button event listener
sendButton.addEventListener('click', async () => {
  const message = userInput.value.trim();
  if (message) { 
    userInput.value = '';
    try {
      const addMessagePromise = new Promise((resolve, reject) => {
        addMessage(username, message, selectedPersona, null, 'sent');
        resolve();
      });
      await addMessagePromise;

      const response = await $.ajax({
        url: '/api/response',
        type: 'POST',
        data: {
          message,
          username: username || 'anonymous',
          persona: selectedPersona
        }
      });
      addMessage(selectedPersona, response.response, selectedPersona, null, 'received');
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, an error occurred. Please try again.', selectedPersona, null, 'received');
    }
  }
});

// Clear button event listener
clearButton.addEventListener('click', () => {
  chatWindow.innerHTML = '';
});

// Get personas from the database
$.ajax({
  url: '/api/personas',
  type: 'GET',
  dataType: 'json',
  success: function(data) {
    const uniqueNames = new Set();
    const dropdown = document.querySelector('#persona-dropdown');
    for (const persona of data[0].personas) {
      const name = persona.name;
      if (!uniqueNames.has(name)) {
        uniqueNames.add(name);
        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        dropdown.appendChild(option);
      }
    }
    
    // Set the default value for the dropdown
    dropdown.options[0].selected = true;
    
    // Trigger the change event to update the selectedPersona variable
    dropdown.dispatchEvent(new Event('change'));
  },
  error: function(error) {
    console.error('Error getting personas:', error);
  }
});

// todayChatsButton event listener
const todaysChatsButton = document.querySelector('#todays-chats-btn');
todaysChatsButton.addEventListener('click', loadTodayChatHistory);

// Today's chat history function
async function loadTodayChatHistory() {
  try {
    const chatHistory = await $.ajax({
      url: '/api/chat-history',
      type: 'POST',
      data: {
        username,
        selectedPersona,
        messageType: "history",
      },
    });

    // Clear the chat window
    chatWindow.innerHTML = '';

    // Get the chat history for today's date
    const today = new Date();
    const chatHistoryToday = chatHistory.filter(message => {
      const messageDate = new Date(message.time);
      return messageDate.getDate() === today.getDate() &&
             messageDate.getMonth() === today.getMonth() &&
             messageDate.getFullYear() === today.getFullYear();
    });

    // Add chat history to the chat window
    for (const message of chatHistoryToday) {
      addMessage(
        message.sender,
        message.message,
        message.selectedPersona,
        message.response,
        message.time,
        "history",
      );
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}



