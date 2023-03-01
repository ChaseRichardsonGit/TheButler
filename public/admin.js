// When the dark mode button is clicked, toggle the dark mode class on the body
$('#dark-mode-btn').on('click', () => {
    $('body').toggleClass('dark-mode');
  });

// Define the endpoint for the personas API
const PERSONAS_API_URL = '/api/personas';

// When the DOM is ready, load the personas and populate the dropdown
$(document).ready(() => {
  // Load the personas from the server
  $.get(PERSONAS_API_URL)
    .done((response) => {
      // Get the dropdown element
      const dropdown = $('#persona-dropdown');

      // Add each persona to the dropdown
      response[0].personas.forEach((persona) => {
        const option = $('<option>').val(persona.name).text(persona.name);
        dropdown.append(option);
      });

      // Trigger the change event to populate the persona name and data
      dropdown.trigger('change');
    })
    .fail((error) => {
      console.error('Failed to load personas:', error);
    });

  // When the persona is changed, update the persona name and data
  $('#persona-dropdown').on('change', async (event) => {
    const personaName = event.target.value;
    const personaData = await getPersonaData(personaName);
    $('#persona-name').val(personaName);
    $('#persona-data').val(JSON.stringify(personaData, null, 2));
  });

  // When the save button is clicked, update the persona data in MongoDB
  $('#save-persona-data-btn').on('click', async (event) => {
    const personaName = $('#persona-name').val();
    const personaData = $('#persona-data').val();
  
    try {
      // Attempt to parse the persona data as JSON
      const parsedData = JSON.parse(personaData);
  
      // Send the parsed data to the server
      const response = await $.ajax({
        type: 'PUT',
        url: `/api/personas/${personaName}`,
        data: { data: parsedData }, // send an object with a "data" key
        dataType: 'json',
      });
  
      console.log(`Updated persona data for ${personaName}:`, response);
    } catch (error) {
      // Handle the syntax error if the data is not valid JSON
      console.error(`Failed to update persona data for ${personaName}:`, error);
    }
  });

  // Get persona data from the server
  async function getPersonaData(personaName) {
    try {
      const response = await $.get(`/api/personas/${personaName}`);
      return response.personas[0].data[0];
    } catch (error) {
      console.error(`Failed to get persona data for ${personaName}:`, error);
      return null;
    }
  }

  // When the "Convert to JSON" button is clicked, convert plain text to JSON
  $('#convert-to-json-btn').on('click', () => {
    const plainText = $('#persona-data').val().trim();

    if (plainText === '') {
      alert('Please enter some plain text to convert to JSON.');
      return;
    }

    const json = {
      message: plainText,
    };

    $('#persona-data').val(JSON.stringify(json, null, 2));
  });
});

// When the "New Persona" button is clicked, create a new persona in MongoDB
$('#new-persona-btn').on('click', async (event) => {
  const personaName = prompt('Enter the new persona name:');
  if (!personaName) return;

  const personaData = prompt('Enter the new persona data:');
  if (!personaData) return;

  try {
    // Attempt to parse the persona data as JSON
    const parsedData = JSON.parse(personaData);

    // Send the parsed data to the server
    const response = await $.post('/api/personas', {
      name: personaName,
      data: parsedData,
    });

    console.log(`Created new persona ${personaName}:`, response);

    // Add the new persona to the dropdown
    const option = $('<option>').val(personaName).text(personaName);
    $('#persona-dropdown').append(option);

    // Set the new persona as the selected persona
    $('#persona-dropdown').val(personaName).trigger('change');
  } catch (error) {
    // Handle the syntax error if the data is not valid JSON
    console.error(`Failed to create new persona ${personaName}:`, error);
  }
});

// When the search button is clicked, redirect to the chat history page
$('#search-history-btn').on('click', async () => {
  const username = $('#username-input').val().trim();
  const selectedPersona = $('#persona-input').val().trim();
  
  try {
    // Retrieve chat history from server
    const response = await $.post('/api/chat-history', {
      username: username,
      selectedPersona: selectedPersona,
    });

    // Redirect to history page with chat history data
    const chatHistory = encodeURIComponent(JSON.stringify(response));
    const url = `/history.html?chatHistory=${chatHistory}`;
    window.location.href = url;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
  }
});

// When the page loads, append chat history to chat window if chatHistory is present in URL params
$(document).ready(() => {
  // Extract chat history data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const chatHistory = urlParams.get('chatHistory');

  if (chatHistory) {
    try {
      const parsedChatHistory = JSON.parse(decodeURIComponent(chatHistory));
      console.log(parsedChatHistory);
      // Append chat history to chat window
      const chatWindow = document.querySelector('#chat-window');
      for (const message of parsedChatHistory) {
        const div = document.createElement('div');
        div.innerHTML = `${message.sender}: ${message.message}`;
        chatWindow.appendChild(div);
      }
    } catch (error) {
      console.error('Error parsing chat history:', error);
    }
  }
});
