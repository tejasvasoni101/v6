//

// Map to store stock name to ID mapping
const stockIdMap = {};

function fetchAndDisplayStockData() {
  // Fetch all data from API
  $.get("https://stocktrafficcontrol.online/getDwh", function (data) {
    // Sort data based on net earnings in ascending order
    const allStocks = data.sort((a,b)=>{
      if(a.isRemoved === b.isRemoved){
      if(a.toBuy !== b.toBuy){
      return a.toBuy ? -1:1;
      }
      return (a.budget >= b.budget) ? -1: 1;
      }
      return a.isRemoved ? 1 : -1;
      });

    // Create DataTable
    const table = $("<table>").attr("id", "stockTable").addClass("display");
    const thead = $("<thead>").appendTo(table);
    const tbody = $("<tbody>").appendTo(table);

    // Create table header
    const headerRow = $("<tr>").appendTo(thead);
    $("<th>").text("Stock Name").appendTo(headerRow);
    $("<th>").text("Open to buy").appendTo(headerRow);
    $("<th>").text("Budget").appendTo(headerRow);
    $("<th>").text("Deleted stock").appendTo(headerRow);
    // $("<th>").text("Updated At").appendTo(headerRow);
    $("<th>").text("Update").appendTo(headerRow);

    // Populate stockIdMap and table rows with data
    allStocks.forEach((item) => {
      // Populate stockIdMap
      stockIdMap[item.stockName] = item.stockId;

      const row = $("<tr>").appendTo(tbody);
      $("<td>").text(item.stockName).appendTo(row);
      $("<td>")
        .text(item.toBuy ? "Yes" : "No")
        .appendTo(row);
      const budgetCell = $("<td>")
        .addClass("editable")
        .text(item.budget)
        .appendTo(row);
      const isRemovedCell = $("<td>")
        .addClass("editable")
        .text(item.isRemoved ? "Yes" : "No")
        .appendTo(row);
      // $("<td>").text(Date(item.updatedAt).toString()).appendTo(row);

      // Add update button
      const updateButton = $("<button>")
        .addClass("updateButton")
        .text("Update")
        .appendTo($("<td>").appendTo(row));
      updateButton.click(function () {
        editRow(row, budgetCell, isRemovedCell);
      });

      // Style row based on requirements
      if (item.isRemoved) {
        row.addClass("removed");
        row.css("background-color", "grey");
      } else if (item.toBuy) {
        row.addClass("toBeRemoved");
        // row.css("background-color", "#F7D415");
      }
    });

    // Append DataTable to container and initialize DataTable
    $("#tableContainer").empty().append(table);
    $("#stockTable").DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search functionality
      ordering: false, // Enable sorting
      info: false, // Disable showing information
      pageLength: 25,
    });
  });
}

function editRow(row, budgetCell, isRemovedCell) {
  // Make budget and isRemoved cells editable
  budgetCell.attr("contenteditable", true).focus();
  isRemovedCell.attr("contenteditable", true);
  budgetCell.addClass("editableActive");
  isRemovedCell.addClass("editableActive");

  // Trigger API call on pressing Enter key
  $(document).on("keypress", function (e) {
    if (e.which === 13) {
      // Enter key pressed
      const stockName = row.find("td:nth-child(1)").text();
      const stockId = stockIdMap[stockName];
      const budget = parseInt(budgetCell.text());
      const isRemoved = isRemovedCell.text().toLowerCase() === "yes";

      // Make API call to update data
      $.ajax({
        url: "https://stocktrafficcontrol.online/Dwh",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ stockId, budget, isRemoved }),
        success: function (response) {
          console.log("Data updated successfully:", response);
          row.removeClass("edited");
          row.addClass("success");
          budgetCell.attr("contenteditable", false);
          isRemovedCell.attr("contenteditable", false);
          budgetCell.removeClass("editableActive");
          isRemovedCell.removeClass("editableActive");
          $(document).off("keypress");
        },
        error: function (xhr, status, error) {
          console.error("Error updating data:", error);
        },
      });
    }
  });
}

function updateRow(stockName, row) {
  // Extract stockId from stockIdMap
  const stockId = stockIdMap[stockName];

  // Extract updated values from the row
  const toBuy = row.find("td:nth-child(2)").text().toLowerCase() === "yes";
  const budget = parseInt(row.find("td:nth-child(3)").text());
  const isRemoved = row.find("td:nth-child(4)").text().toLowerCase() === "yes";

  // Make API call to update data
  $.ajax({
    url: "https://stocktrafficcontrol.online/Dwh",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ stockId, budget, isRemoved }),
    success: function (response) {
      console.log("Data updated successfully:", response);
      row.removeClass("edited");
      row.addClass("success");
    },
    error: function (xhr, status, error) {
      console.error("Error updating data:", error);
    },
  });
}

$(document).ready(function () {
  fetchAndDisplayStockData();

  // Enable cell editing on click
  $(document).on("click", ".editable", function () {
    $(this).attr("contenteditable", true).focus();
    $(this).addClass("editableActive");
  });

  // Bind click event to update button
  $(document).on("click", ".updateButton", function () {
    const row = $(this).closest("tr");
    const stockName = row.find("td:nth-child(1)").text();
    updateRow(stockName, row);
  });
});