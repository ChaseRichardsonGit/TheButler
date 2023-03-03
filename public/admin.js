// Define the endpoint for the personas API
const PERSONAS_API_URL = '/api/personas';

// Get persona data from the server
async function getPersonaData(personaName) {
  try {
    const response = await $.get(`/api/personas/${personaName}`);
    return response.personas[0];
  } catch (error) {
    console.error(`Failed to get persona data for ${personaName}:`, error);
    return null;
  }
}

// When the DOM is ready, load the personas and populate the dropdown
$(document).ready(async () => {
  try {
    // Load the personas from the server
    const response = await $.get(PERSONAS_API_URL);

    // Get the dropdown element
    const dropdown = $('#persona-dropdown');

    // Add each persona to the dropdown
    response[0].personas.forEach((persona) => {
      const option = $('<option>').val(persona.name).text(persona.name);
      dropdown.append(option);
    });

    // Populate the persona data fields
    const personaName = dropdown.val();
    const personaData = await getPersonaData(personaName);
    populatePersonaData(personaData);

    // Trigger the change event to populate the persona name and data
    dropdown.on('change', async (event) => {
      const personaName = event.target.value;
      const personaData = await getPersonaData(personaName);
      populatePersonaData(personaData);
    });
  } catch (error) {
    console.error('Failed to load personas:', error);
  }
});

function populatePersonaData(personaData) {
  $('#persona-name').val(personaData.name);

  // Display the first data field, if it exists
  if (personaData.data) {
    $('#persona-data').val(personaData.data);
  } else {
    $('#persona-data').val('');
  }

  // Display the remaining data fields, even if they are empty
  for (let i = 1; i < 5; i++) {
    const personaDataField = $(`#persona-data-${i+1}`);
    if (personaData[`data${i+1}`]) {
      personaDataField.val(personaData[`data${i+1}`]);
    } else {
      personaDataField.val('');
    }
  }
  
  // Display any additional data fields (data3, data4, etc.), if they exist
  const personaDataContainer2 = $('#persona-data-container2');
  personaDataContainer2.empty();
  for (let i = 2; i < personaData.data.length; i++) {
    const personaDataField = $(`<textarea class="form-control" id="persona-data-${i+1}" name="data${i+1}">`)
      .val(personaData[`data${i+1}`] || ''); // Use the second or third field from persona data array, or empty string if field does not exist
    const personaDataLabel = $(`<label for="persona-data-${i+1}">`)
      .text(`Persona Data${i+1}:`);
    personaDataContainer2.append(personaDataLabel, personaDataField);
  }
}

// When the save button is clicked, update the persona data in MongoDB
$('#save-persona-data-btn').on('click', async (event) => {
  const personaName = $('#persona-name').val();
  const personaData = {
    name: $('#persona-name').val(),
    data: $('#persona-data').val(),
    data2: $('#persona-data-2').val(),
    data3: $('#persona-data-3').val(),
    data4: $('#persona-data-4').val(),
    data5: $('#persona-data-5').val(),
  };
  //console.log(personaName, personaData);
  try {
    // Send the data to the server
    const response = await $.ajax({
      type: 'PUT',
      url: `/api/personas/${personaName}`,
      data: personaData, // send the JSON object directly
      dataType: 'json',
    });

   // console.log(response);

    console.log(`Updated persona data for ${personaName}: ${personaData}`, response);
    alert(`Your changes have been saved for ${personaName}`);
  } catch (error) {
    console.error(`Failed to update persona data for ${personaName}:`, error);
  }
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

const converter = new showdown.Converter();

// Search History button click handler
$(document).ready(() => {
  $('#search-history-btn').on('click', async () => {
    const username = $('#username-input').val().trim();
    const selectedPersona = $('#persona-input').val().trim();
  
    try {
      // Retrieve chat history from server
      const response = await axios.post('/api/chat-history', {
        username: username,
        selectedPersona: selectedPersona,
      });

      // Append chat history to chat window
      const chatWindow = document.querySelector('#chat-window');
      chatWindow.innerHTML = ''; // clear the chat window
      for (const message of response.data) {
        const div = document.createElement('div');
        const sender = message.sender;
        const messageText = message.message;
        const htmlMessage = converter.makeHtml(messageText); // convert message to HTML
        div.innerHTML = `<strong>${sender}</strong>: ${htmlMessage}`;
        chatWindow.appendChild(div);
      }
    } catch (error) {
      console.error('Error retrieving chat history:', error);
    }
  });
});