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
    console.log('Username set:', username);
  }
});

sendButton.addEventListener('click', async () => {
  try {
    console.log('Button clicked!');
    const message = userInput.value;
    console.log('Input value:', message);
    userInput.value = '';
    addMessage(username, message); // Pass the username variable to addMessage
    if (typeof openai.generateResponse !== 'function') {
      throw new Error('The generateResponse function is not defined');
    }
    const response = await openai.generateResponse(message);
    console.log('Bot Response:', response);
    addMessage('bot', response);
  } catch (error) {
    console.error(error);
    addMessage('bot', 'Sorry, an error occurred. Please try again.');
  }
});

function addMessage(sender, message) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = `<span>${sender}: </span>${message}`;
  chatWindow.appendChild(div);
}
