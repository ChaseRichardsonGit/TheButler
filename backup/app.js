// Connect to the OpenAI chat API
const chatAPI = new OpenAIChatAPI();

// Retrieve the chat window and message form elements
const chatWindow = document.querySelector('#chat-window');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');

// Handle form submission
messageForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	const message = messageInput.value;
	if (message) {
		// Send the user's message to the chat API
		const response = await chatAPI.send(message);
		// Add the user's message to the chat window
		appendMessage('User', message);
		// Add the chat API's response to the chat window
		appendMessage('OpenAI', response.choices[0].text);
		// Clear the message input
		messageInput.value = '';
	}
});

// Append a message to the chat window
function appendMessage(sender, message) {
	const messageElement = document.createElement('div');
	messageElement.classList.add('mb-2');
	if (sender === 'User') {
		messageElement.classList.add('text-right');
	}
	messageElement.innerHTML = `
		<small><em>${sender}:</em></small>
		<p class="mb-0">${message}</p>
	`;
	chatWindow.appendChild(messageElement);
	chatWindow.scrollTop = chatWindow.scrollHeight;
}
