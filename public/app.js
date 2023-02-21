const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');
const usernameInput = document.querySelector('#username-input');
const usernameSubmitButton = document.querySelector('#username-submit-button');

let username = '';


usernameSubmitButton.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username) {
    usernameInput.value = '';
    usernameInput.disabled = true;
    usernameSubmitButton.disabled = true;
    const usernameContainer = document.getElementById('username-container');
    usernameContainer.innerHTML = `Hello, ${username}!`;
  }
});

usernameInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    usernameSubmitButton.click();
  }
});

userInput.addEventListener('keyup', (event) => {
  event.preventDefault();
  if (event.keyCode === 13) {
    sendButton.click();
  }
});

const dropdown = document.createElement('select');
dropdown.id = 'persona-dropdown';

dropdown.addEventListener('change', (event) => {
  selectedPersona = event.target.value;
  console.log(`Selected persona: ${selectedPersona}`);
});

const personaDropdown = document.querySelector('#persona-dropdown');
let selectedPersona = '';


personaDropdown.addEventListener('change', (event) => {
  selectedPersona = event.target.value;
  const headerFrame = document.getElementById('header-frame');

  if (selectedPersona === 'puerus') {
    headerFrame.style.backgroundColor = 'gray';
  } else if (selectedPersona === 'jarvis') {
    headerFrame.style.backgroundColor = 'green';
  } else {
    headerFrame.style.backgroundColor = '#1d1d1d';
  }
});

async function addMessage(sender, message, selectedPersona, response) {
  const timestamp = Date.now();
  const div = document.createElement('div');
  let senderName = sender;
  
  if (sender === 'bot') {
    senderName = selectedPersona;
  }
    
  div.className = `message ${senderName}`;
  div.innerHTML = `<span>${senderName}: </span>${message}`;

  if (sender === username) {
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    let messageType;
    let receiver;

    if (sender === username) {
      messageType = 'sent';
      receiver = selectedPersona;
    } else {
      messageType = 'received';
      receiver = username;
    }
    $.ajax({
      url: '/api/save-message',
      type: 'POST',
      data: {
        username,
        message,
        timestamp,
        messageType,
        persona: selectedPersona,
        sender,
        response 
      }
    })

    .done((response) => {
      console.log('Message saved to database:', response);
    })
    .fail((error) => {
      console.error('Error saving message to database:', error);
    });
  } else {
    // Handle received messages here
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  if (sender === username) {
    try {
      const response = await $.ajax({
        url: '/api/response',
        type: 'POST',
        data: { 
          message,
          username,
          persona: selectedPersona
        }
      });
      addMessage(selectedPersona, response.response);
      } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, an error occurred. Please try again.', selectedPersona);
    }
  }
}

sendButton.addEventListener('click', () => {
  const message = userInput.value;
  userInput.value = '';
  addMessage(username, message, selectedPersona); // pass selectedPersona as an argument
});

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