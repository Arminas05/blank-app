# 🎈 Blank app template

A simple Streamlit app template for you to modify!

[![Open in Streamlit](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://blank-app-template.streamlit.app/)

### How to run it on your own machine

1. Install the requirements

   ```
   $ pip install -r requirements.txt
   ```

2. Run the app

   ```
   $ streamlit run streamlit_app.py
   ```

### Simulator

The app now lets you fetch historical prices for a stock or ETF using `yfinance`.
Enter a ticker symbol and an optional date range. The app downloads daily data,
calculates daily percentage returns, and then annualizes the mean and standard
deviation to produce expected return and volatility estimates.
