$(document).ready(function () {
    function fetchStockData() {
        $.ajax({
            url: "/api/stocks",  // Make sure this endpoint provides correctly filtered data
            method: "GET",
            dataType: "json",
            success: function (data) {
                updateTables(data);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching stock data:", error);
            }
        });
    }

    function updateTables(data) {
        let stockTableBody = $("#stock-table-body");
        let etfTableBody = $("#etf-table-body");

        stockTableBody.empty();  // Clear existing rows
        etfTableBody.empty();

        data.forEach(item => {
            let row = `
                <tr>
                    <td>${item.Stock}</td>
                    <td>${item["Buy Price"]}</td>
                    <td>${item.Quantity}</td>
                    <td>${item["Invested Amount"]}</td>
                    <td>${item["Current Price"]}</td>
                    <td>${item["Profit/Loss"]}</td>
                    <td style="color: ${item['Percentage Change'] > 0 ? 'green' : 'red'};">
                        ${item['Percentage Change']}%
                    </td>
                    <td>${item["Todays Change"]}</td>
                    <td style="color: ${item['Todays Change Percent'] > 0 ? 'green' : 'red'};">
                        ${item['Todays Change Percent']}%
                    </td>
                </tr>
            `;

            if (item.Type.toLowerCase().trim() === "stock") {
                stockTableBody.append(row);
            } else if (item.Type.toLowerCase().trim() === "etf") {
                etfTableBody.append(row);
            }
        });
    }

    $("#refresh-btn").click(function () {
        fetchStockData();  // Refresh data when button is clicked
    });

    fetchStockData(); // Initial load
});
