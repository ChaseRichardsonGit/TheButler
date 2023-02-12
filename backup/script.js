const chatWindow = document.querySelector('#chat-window');
const userInput = document.querySelector('#user-input');
const sendButton = document.querySelector('#send-button');

sendButton.addEventListener('click', async () => {
  console.log('Button clicked!');
  const message = userInput.value;
  console.log('Input value:', message);
  userInput.value = '';
  addMessage('user', message);
  const response = await getResponse(message);
  console.log('Bot Response:', response);
  addMessage('bot', response);
});

async function getResponse(prompt) {
  const url = `/api/response?prompt=${encodeURIComponent(prompt)}`;
  const response = await fetch(url);
  return response.text();
}

function addMessage(sender, message) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = `<span>${sender}: </span>${message}`;
  chatWindow.appendChild(div);
}
