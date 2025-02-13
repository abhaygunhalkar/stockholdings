$(document).ready(function () {
    function fetchStockData() {
        $.ajax({
            url: "/api/stocks",
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

        stockTableBody.empty();
        etfTableBody.empty();

        let totalStockInvested = 0, totalStockProfitLoss = 0;
        let totalETFInvested = 0, totalETFProfitLoss = 0;

        data.forEach(item => {
            let row = `
                <tr>
                    <td>${item.Stock}</td>
                    <td>${item["Buy Price"]}</td>
                    <td>${item.Quantity}</td>
                    <td>${item["Invested Amount"].toFixed(2)}</td>
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
                totalStockInvested += item["Invested Amount"];
                totalStockProfitLoss += item["Profit/Loss"];
            } else if (item.Type.toLowerCase().trim() === "etf") {
                etfTableBody.append(row);
                totalETFInvested += item["Invested Amount"];
                totalETFProfitLoss += item["Profit/Loss"];
            }
        });

        // Add total row for stocks
        stockTableBody.append(`
            <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>${totalStockInvested.toFixed(2)}</strong></td>
                <td></td>
                <td><strong>${totalStockProfitLoss.toFixed(2)}</strong></td>
                <td colspan="3"></td>
            </tr>
        `);

        // Add total row for ETFs
        etfTableBody.append(`
            <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>${totalETFInvested.toFixed(2)}</strong></td>
                <td></td>
                <td><strong>${totalETFProfitLoss.toFixed(2)}</strong></td>
                <td colspan="3"></td>
            </tr>
        `);
    }

    $("#refresh-btn").click(function () {
        fetchStockData();
    });

    fetchStockData();
});
