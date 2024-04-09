// dashboard2Component.js

// Function to fetch data from API
function fetchDataAndUpdateTable() {
    // Display loading message
    $("#updateTime").text("Fetching Data from backend...");
  
    // Fetch data from API
    $.get("https://stocktrafficcontrol.online/findStock?all=1&days=7", function(data) {
      const timestamp = new Date().toLocaleString();
      // Store data in local storage with timestamp
      const trueData = JSON.parse(data).extras;
      if(trueData && trueData.length > 0){
        localStorage.setItem("stockData", JSON.stringify({ timestamp, data: trueData }));
      }
      console.log("divya");
      // Update table with fetched data
      updateTable1(trueData, timestamp);
    }).fail(function() {
      $("#updateTime").text("Failed to fetch data. Please try again.");
    });
  }
  
  // Function to update table with fetched data
  function updateTable(data, timestamp) {
    const table = $("<table>");
    const thead = $("<thead>").appendTo(table);
    const tbody = $("<tbody>").appendTo(table);
  
    // Create table header
    const headerRow = $("<tr>").appendTo(thead);
    $("<th>").text("Stock Name").appendTo(headerRow);
    $("<th>").text("Weekly Change").appendTo(headerRow);
    $("<th>").text("Old Price").appendTo(headerRow);
    $("<th>").text("Current Price").appendTo(headerRow);
  
    // Populate table rows with data
    data.forEach(item => {
      const row = $("<tr>").appendTo(tbody);
      $("<td>").text(item.stockName).appendTo(row);
      $("<td>").text((Math.round(10000*item.currentChange))/10000).appendTo(row);
      $("<td>").text(item.oldPrice).appendTo(row);
      $("<td>").text(item.currentPrice).appendTo(row);
    });
  
    // Update table
    $("#stockTable2").empty().append(table);
    $("#updateTime").text("Last Updated: " + timestamp);
  }

  function updateTable1(data, timestamp) {
    // Clear existing DataTable if it exists
    if ($.fn.DataTable.isDataTable('#stockTable2')) {
        $('#stockTable2').DataTable().clear().destroy();
    }
    // Initialize DataTable
    const table = $('#stockTable2').DataTable({
        "paging": true, // Enable pagination
        "searching": true, // Enable search functionality
        "ordering": true, // Enable sorting
        "info": false, // Disable showing information
        "data": data, // Set data source
        "pageLength": 25,
        "columns": [
            { "data": "stockName","title": "Stock Name" },
            { 
              "data": "currentChange",
              "title": "Current Change",
              "render": function(data, type, row) {
                // Convert the value to floor value
                if (type === 'display' || type === 'filter') {
                  return (Math.round(1000*data))/1000; // Return floor value for display and filtering
                }
                return data; // Return original value for sorting and other purposes
              }
          },
            { "data": "oldPrice","title": "Old Price" },
            { "data": "currentPrice","title": "Current Price" }
        ],
        "columnDefs": [
        ]
    });

    // Update table
    $("#updateTime").text("Last Updated: " + timestamp);
}

  
  $(document).ready(function() {
    // Check if data is present in local storage
    let storedData = localStorage.getItem("stockData");
    if (storedData) {
      const { timestamp, data } = JSON.parse(storedData);
      updateTable1(data, timestamp);
    } else {
      fetchDataAndUpdateTable();
    }
  
    // Add event listener for update button
    $("#updateButton").click(fetchDataAndUpdateTable);
  });
  
