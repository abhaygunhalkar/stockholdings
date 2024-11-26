async function refreshData() {
    const tableBody = document.getElementById('stocks-table');
    tableBody.innerHTML = ''; // Clear the existing rows
    try {
        const response = await fetch('/api/stocks');
        const stocks = await response.json();

        if (!stocks.length) {
            tableBody.innerHTML = '<tr><td colspan="8">No stock data available.</td></tr>';
            return;
        }

        stocks.forEach((stock) => {
            const row = document.createElement('tr');

            const profitLossClass = stock["Profit/Loss"] < 0 ? 'text-danger' : 'text-success'; // Red for negative, green for positive
            const unrealizedClass = stock["Unrealized Profit/Loss"] < 0 ? 'text-danger' : 'text-success'; // Same for Unrealized Profit/Loss

            row.innerHTML = `
                <td>${stock.Stock}</td>
                <td>${stock["Buy Price"].toFixed(2)}</td>
                <td>${stock.Quantity}</td>
                <td>${stock["Invested Amount"].toFixed(2)}</td>
                <td>${stock["Current Price"].toFixed(2)}</td>
                <td class="${unrealizedClass}">${stock["Unrealized Profit/Loss"].toFixed(2)}</td>
                <td class="${unrealizedClass}">${stock["Percentage Change Today"].toFixed(2)}</td>


            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="8">Failed to load stock data. Please try again.</td></tr>';
    }
}

