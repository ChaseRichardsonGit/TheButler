const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');
const usernameInput = document.querySelector('#username-input');
const usernameSubmitButton = document.querySelector('#username-submit-button');

let username = '';

// Username Submit 
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
async function addMessage(sender, message, selectedPersona, response) {
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
          username: username || 'anonymous',
          persona: selectedPersona
        }
      });
      addMessage(selectedPersona, response.response, selectedPersona);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, an error occurred. Please try again.', selectedPersona);
    }
  }
}

// Send button event listener
sendButton.addEventListener('click', () => {
  const message = userInput.value;
  userInput.value = '';
  addMessage(username, message, selectedPersona); 
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