import yfinance as yf
import pandas as pd
from flask import Flask, jsonify, render_template
import math

app = Flask(__name__)

def sanitize_data(data):
    for row in data:
        for key, value in row.items():
            if isinstance(value, float) and math.isnan(value):  # Check for NaN
                row[key] = None  # Replace NaN with None (converted to null in JSON)
    return data


    # Load stock data and fetch real-time prices
def load_stock_data():
    try:
        # Read the Excel file
        file_path = 'mystockholdings.xlsx'
        df = pd.read_excel(file_path)

        # Ensure required columns are present
        required_columns = ['Stock', 'Buy Price', 'Quantity']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return {"error": f"Missing columns in Excel file: {', '.join(missing_columns)}"}

        # Fetch real-time stock prices and calculate values
        stock_symbols = df['Stock'].tolist()
        real_time_prices = {}
        todays_change = {}
        todays_change_percent = {}
        
        for symbol in stock_symbols:
            ticker = yf.Ticker(symbol)
            stock_data = ticker.history(period='5d')
            
            if not stock_data.empty and len(stock_data) >= 2:
                real_time_prices[symbol] = stock_data['Close'].iloc[-1]
                yesterday_close = stock_data['Close'].iloc[-2]
                change = real_time_prices[symbol] - yesterday_close
                todays_change[symbol] = change
                todays_change_percent[symbol] = round((change / yesterday_close) * 100, 2)
            else:
                real_time_prices[symbol] = 0
                todays_change[symbol] = 0
                todays_change_percent[symbol] = 0

        # Validate that mappings are dictionaries
        if not isinstance(todays_change, dict) or not isinstance(todays_change_percent, dict):
            print('Internal error: Mapping variables are not dictionaries.')
            return {"error": "Internal error: Mapping variables are not dictionaries."}
        
        # Add calculated fields to the DataFrame
        df['Invested Amount'] = df['Buy Price'] * df['Quantity']
        df['Current Price'] = df['Stock'].map(real_time_prices)
        df['Profit/Loss'] = (df['Current Price'] - df['Buy Price']) * df['Quantity']
        df['Percentage Change'] = ((df['Current Price'] - df['Buy Price']) / df['Buy Price']) * 100
        df['Todays Change'] = df['Stock'].map(todays_change)
        df['Todays Change Percent'] = df['Stock'].map(todays_change_percent)

        # Save the updated data back to the Excel file
        df.to_excel(file_path, index=False)

        # Convert to a list of dictionaries for JSON response
        return df.to_dict(orient='records')

    except Exception as e:
        return {"error": str(e)}

# API to fetch stock data
@app.route('/api/stocks')
def get_stocks():
    try:
        data = load_stock_data()
        sanitized_data = sanitize_data(data)  # Sanitize for NaN
        formatted_data = format_data(sanitized_data)  # Format numbers
        return jsonify(formatted_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_data(data):
    for row in data:
        for key, value in row.items():
            if isinstance(value, float):  # Check if the value is a float
                row[key] = round(value, 2)  # Round to 2 decimal places
    return data

# Frontend route
@app.route('/stocks')
def stock_page():
    return render_template('stocks.html')

if __name__ == '__main__':
    app.run(debug=True)
