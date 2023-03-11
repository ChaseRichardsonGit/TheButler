// Robotomize History button click handler
document.addEventListener('DOMContentLoaded', () => {
    const updateHistoryForm = document.getElementById('update-history-form');
    updateHistoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const sender = document.getElementById('sender-input').value;
      const count = document.getElementById('count-input').value;
  
      console.log('Sender:', sender);
      console.log('Count:', count);
  
      try {
        const response = await fetch(`/api/history/${sender}/${count}`, { method: 'PUT' });
        const data = await response.json();
        console.log('Response:', data);
  
        // Display success message popup
        const successPopup = $('<div class="modal fade" id="success-popup" tabindex="-1" aria-labelledby="success-popup-label" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="success-popup-label">Success</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">Chat history updated successfully.</div></div></div></div>');
        successPopup.modal('show');
        // Reload the page after the popup is dismissed
        successPopup.on('hidden.bs.modal', function () {
          location.reload();
        });
  
        $('#update-history-modal').modal('hide');
      } catch (error) {
        console.error(error);
      }
  
      return false; // Prevent default form submission behavior
    });
  });