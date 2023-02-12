const apiUrl = 'http://localhost:3000/api/message';
const sendButton = document.querySelector('.btn-primary');
const userInput = document.querySelector('input');
const messagesDiv = document.querySelector('.messages');

// sendButton.addEventListener('click', async function() {
//   const message = userInput.value;
//   if (!message) return;
//   messagesDiv.innerHTML += `<div class="message user">${message}</div>`;
//   userInput.value = '';
//   const response = await sendMessage(message);
//   messagesDiv.innerHTML += `<div class="message bot">${response}</div>`;
// });

userInput.addEventListener('keypress', async function(e) {
  if (e.which === 13) {
    sendButton.click();
  }
});

async function sendMessage(message) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  return data.message;
}
