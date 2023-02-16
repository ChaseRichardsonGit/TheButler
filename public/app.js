const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');
const usernameInput = document.querySelector('#username-input');
const usernameSubmitButton = document.querySelector('#username-submit-button');

import { openai } from './webserver.js';

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

sendButton.addEventListener('click', async () => {
  try {
    console.log('Button clicked!');
    const message = userInput.value;
    console.log('Input value:', message);
    userInput.value = '';
    addMessage(username, message);
    const response = await openai.createCompletion({
      engine: 'text-davinci-003',
      prompt: message,
      max_tokens: 1000,
      temperature: .7,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
      stop: ""
    });
    console.log('Bot Response:', response);
    addMessage('bot', response);
  } catch (error) {
    console.error(error);
    addMessage('bot', 'Sorry, an error occurred. Please try again.');
  }
});

function addMessage(sender, message) {
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
}

