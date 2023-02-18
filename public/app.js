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

sendButton.addEventListener('click', () => {
  const message = userInput.value;
  userInput.value = '';
  addMessage(username, message);
});

async function addMessage(sender, message) {
  const timestamp = Date.now();
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = `<span>${sender}: </span>${message}`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Send message data to server
  $.ajax({
    url: '/api/save-message',
    type: 'POST',
    data: {
      username,
      message,
      timestamp
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
        data: { message }
      });
      addMessage('bot', response.response);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, an error occurred. Please try again.');
    }
  }
}

//const logoImage = document.getElementById('logo-image');
const dropdown = document.createElement('select');
dropdown.id = 'persona-dropdown';

$.ajax({
  url: '/api/personas',
  type: 'GET',
  dataType: 'json',
  success: function(data) {
    const uniqueNames = new Set();
    console.log('dropdown:', dropdown);
    for (const persona of data[0].personas) {
      const name = persona.name;
      if (!uniqueNames.has(name)) {
        uniqueNames.add(name);
        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        dropdown.appendChild(option);
        console.log(`Added option with value ${option.value} and text ${option.text} to dropdown`);
        //console.log('Personas:', data[0].personas)
        //console.log('Personas:', data[0].personas[0])
        //console.log('Personas:', data[0].personas[0].name)
        console.log(uniqueNames.entries());
      }
    }
    console.log('Dropdown:', dropdown);
  },
  
  error: function(error) {
    console.error('Error getting personas:', error);
  }
});

dropdown.addEventListener('change', (event) => {
  const selectedPersona = event.target.value;
  console.log(`Selected persona: ${selectedPersona}`);
});

// // New code for checking for new messages
// let lastTimestamp = 0;
// setInterval(() => {
//   $.ajax({
//     url: '/api/new-messages',
//     type: 'POST',
//     data: { lastTimestamp },
//     dataType: 'json',
//     success: function(data) {
//       for (const message of data) {
//         addMessage(message.username, message.message);
//         lastTimestamp = message.timestamp;
//       }
//     },
//     error: function(error) {
//       console.error('Error checking for new messages:', error);
//     }
//   });
// }, 1000);
