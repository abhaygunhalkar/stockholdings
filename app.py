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
        file_path = 'mystockholdings.xlsx'
        df = pd.read_excel(file_path)

        required_columns = ['Stock', 'Buy Price', 'Quantity', 'Type']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return {"error": f"Missing columns in Excel file: {', '.join(missing_columns)}"}

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

        df['Invested Amount'] = df['Buy Price'] * df['Quantity']
        df['Current Price'] = df['Stock'].map(real_time_prices)
        df['Profit/Loss'] = (df['Current Price'] - df['Buy Price']) * df['Quantity']
        df['Percentage Change'] = ((df['Current Price'] - df['Buy Price']) / df['Buy Price']) * 100
        df['Todays Change'] = df['Stock'].map(todays_change)
        df['Todays Change Percent'] = df['Stock'].map(todays_change_percent)

        df.to_excel(file_path, index=False)

        return df.to_dict(orient='records')
    except Exception as e:
        return {"error": str(e)}

@app.route('/api/stocks')
def get_stocks():
    try:
        data = load_stock_data()
        sanitized_data = sanitize_data(data)
        formatted_data = format_data(sanitized_data)
        return jsonify(formatted_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_data(data):
    for row in data:
        for key, value in row.items():
            if isinstance(value, float):
                row[key] = round(value, 2)
    return data

# Frontend route
@app.route('/stocks')
def stock_page():
    data = load_stock_data()

    if isinstance(data, dict) and "error" in data:
        return f"Error: {data['error']}"

    # Print the raw data for debugging
    #print("Raw Data:", data)

    # Ensure correct filtering with stripped spaces and case insensitivity
    stocks = [item for item in data if str(item.get('Type', '')).strip().lower() == 'stock']
    etfs = [item for item in data if str(item.get('Type', '')).strip().lower() == 'etf']

    return render_template('stocks.html', stocks=stocks, etfs=etfs)

if __name__ == '__main__':
    app.run(debug=True)
