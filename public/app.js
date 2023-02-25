const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');
const usernameInput = document.querySelector('#username-input');
const usernameSubmitButton = document.querySelector('#username-submit-button');
const clearButton = document.querySelector('#clear-btn');

let username = '';
let saveToDatabase = true; 

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
      saveToDatabase = false;
    
      // Add chat history to the chat window
      for (const message of chatHistory) {
        addMessage(
          message.sender,
          message.message,
          message.selectedPersona,
          message.response,
          message.time
        );
      }
      console.log('Chat history loaded successfully' + chatHistory)
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
personaDropdown.addEventListener('change', (event) => {
  selectedPersona = event.target.value;
  const headerFrame = document.getElementById('header-frame');
  const personaImage = document.getElementById('persona-image');

  if (selectedPersona === 'puerus') {
    personaImage.src = '/img/Puerus.png';
  } else if (selectedPersona === 'jarvis') {
    personaImage.src = '/img/Jarvis.png';
  } else if (selectedPersona === 'Butler') {
    personaImage.src = '/img/Butler.png';
  } else {
    headerFrame.style.backgroundColor = '#1d1d1d';
    personaImage.src = '/img/Butler.png';
  }
});

// addMessage function
async function addMessage(sender, message, selectedPersona, response, messageType) {
  const timestamp = Date.now();
  const div = document.createElement('div');
  let senderName = sender;

  if (!sender) {
    senderName = 'anonymous';
  } else if (sender === 'bot') {
    senderName = selectedPersona;
    div.classList.add('bot'); // add the bot class to the div
  }

  div.className = `message ${senderName}`;

  if (sender === username) {
    div.classList.add('user');
  } else if (sender === 'bot') {
    div.classList.add('bot');
    div.classList.add(selectedPersona.toLowerCase());
  }

  div.innerHTML = `<div style="display: inline">${senderName}: </div>${message}<br>`;
  console.log('sender: ' + sender + ' message: ' + message + ' selectedPersona: ' + selectedPersona + ' response: ' + response + ' messageType: ' + messageType + ' timestamp: ' + timestamp)
  if (response) {
    const botMessage = document.createElement('div');
    botMessage.className = `message bot ${selectedPersona.toLowerCase()}`;
    botMessage.innerHTML = `${selectedPersona}: ${response}<br>`;
    chatWindow.appendChild(botMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  if (sender === username && saveToDatabase) {
    let sentMessageType = 'sent';
    messageType = sentMessageType;
    $.ajax({
      url: '/api/save-message',
      type: 'POST',
      data: {
        username,
        message,
        timestamp,
        messageType,
        persona: selectedPersona,
        sender
      }
    })
      .done((response) => {
        console.log('Message saved to database:', response);
      })
      .fail((error) => {
        console.error('Error saving message to database:', error);
      });
  }
}



// Send button event listener
sendButton.addEventListener('click', async () => {
  const message = userInput.value.trim();
  if (message) { // check if message is not empty
    userInput.value = '';
    addMessage(username, message, selectedPersona);
    saveToDatabase = true;
    try {
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