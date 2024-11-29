function fetchStockData() {
    $.get('/api/stocks', function(data) {
        const tableBody = $('#stock-table-body');
        tableBody.empty(); // Clear previous data
        data.forEach(stock => {
            const row = `
                <tr>
                    <td>${stock['Stock']}</td>
                    <td>${stock['Buy Price']}</td>
                    <td>${stock['Quantity']}</td>
                    <td>${stock['Invested Amount']}</td>
                    <td>${stock['Current Price']}</td>
                    <td style="color: ${stock['Profit/Loss'] > 0 ? 'green' : 'red'};">
                        ${stock['Profit/Loss']}
                    </td>
                    <td>${stock['Percentage Change']}</td>
                    <td>${stock['Todays Change']}</td>
                    <td style="color: ${stock['Todays Change Percent'] > 0 ? 'green' : 'red'};">
                        ${stock['Todays Change Percent']}
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }).fail(function(err) {
        alert('Error fetching stock data: ' + err.responseJSON.error);
    });
}

$(document).ready(function() {
    $('#refresh-btn').on('click', fetchStockData);
    fetchStockData(); // Initial load
});
