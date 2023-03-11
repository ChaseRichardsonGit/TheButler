// When the page loads, retrieve and display server stats
$(document).ready(async function() {
    try {
      const response = await $.get('/api/server-stats');
      response.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
  
      const container = $('#server-stats-body');
      container.empty();
      response.forEach(result => {
        const tr = $('<tr>');
        const senderName = $('<a>').attr('href', `/sender-stats/${result.sender}`).text(result.sender);
        tr.append($('<td>').append(senderName));
        tr.append($('<td>').text(result.totalMessages));
        tr.append($('<td>').text(result.totalCost.toFixed(5)));
        tr.append($('<td>').text(result.lastMessage));
        container.append(tr);
      });
  
      // Initialize DataTables on the table
      $('#server-stats-table').DataTable();
    } catch (error) {
      console.error(`Failed to retrieve server stats:`, error);
    }
  });

$(document).ready(function() {
    $('#messagesTable').DataTable({
      order: [[0, "desc"]] // sort by first column (time) in descending order
    });
  });

