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

async function addMessage(sender, message) {
  //console.log(`Adding message from app.js.addMessage#35 ${sender}: ${message}`);
  const timestamp = Date.now();
  const div = document.createElement('div');
  let senderName = sender;
  
  if (sender === 'bot') {
    const selectedOption = personaDropdown.options[personaDropdown.selectedIndex];
    senderName = selectedOption.value;
  }
  if (senderName === 'jarvis') {
    div.classList.add('Jarvis');
  }
  if (senderName === 'puerus') {
    div.classList.add('Puerus');
  }
  
  
  div.className = `message ${senderName}`;
  div.innerHTML = `<span>${senderName}: </span>${message}`;
  if (senderName === 'jarvis') {
    document.getElementById('header-frame').style.backgroundColor = 'green';
  } else {
    document.getElementById('header-frame').style.backgroundColor = '#1d1d1d';
  }
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  let messageType;
  if (sender === username) {
    messageType = 'sent';
  } else {
    messageType = 'received';
  }

  $.ajax({
    url: '/api/save-message',
    type: 'POST',
    data: {
      username,
      message,
      timestamp,
      messageType,
      persona: selectedPersona || personaDropdown.options[0].value
    }
  })
  .done((response) => {
    console.log('Message saved to database:', response);
  })
  .fail((error) => {
    console.error('Error saving message to database:', error);
  });

  if (sender === username) {
    try {
      const response = await $.ajax({
        url: '/api/response',
        type: 'POST',
        data: { 
          message,
          username,
          persona: selectedPersona || personaDropdown.options[0].value
        }
      });
      addMessage('bot', response.response);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, an error occurred. Please try again.');
    }
  }
}

const dropdown = document.createElement('select');
dropdown.id = 'persona-dropdown';

dropdown.addEventListener('change', (event) => {
  const selectedPersona = event.target.value;
  console.log(`Selected persona: ${selectedPersona}`);
});

sendButton.addEventListener('click', () => {
  const message = userInput.value;
  userInput.value = '';
  addMessage(username, message, selectedPersona); 
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
  },
  error: function(error) {
    console.error('Error getting personas:', error);
  }
});

const personaDropdown = document.querySelector('#persona-dropdown');
let selectedPersona = '';

personaDropdown.addEventListener('change', (event) => {
  selectedPersona = event.target.value;
  const headerFrame = document.getElementById('header-frame');

  // $.ajax({
  //   url: '/api/preprompt',
  //   type: 'GET',
  //   data: { persona: selectedPersona },
  //   dataType: 'json',
  //   success: function(data) {
  //     preprompt = data.preprompt;
  //   },
  //   error: function(error) {
  //     console.error('Error getting preprompt data:', error);
  //   }
  // });

  if (selectedPersona === 'puerus') {
    headerFrame.style.backgroundColor = 'yellow';
  } else if (selectedPersona === 'jarvis') {
    headerFrame.style.backgroundColor = 'green';
  } else {
    headerFrame.style.backgroundColor = '#1d1d1d';
  }
});
