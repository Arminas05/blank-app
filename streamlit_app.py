import datetime as dt

import streamlit as st
import pandas as pd
import yfinance as yf

st.title("🎈 My new app")

ticker = st.text_input("Ticker", "SPY")
today = dt.date.today()
default_start = today - dt.timedelta(days=365)
start, end = st.date_input(
    "Date range",
    value=(default_start, today),
)

expected_return = 0.0
volatility = 0.0

try:
    data = yf.download(ticker, start=start, end=end, progress=False)
    if not data.empty:
        daily_returns = data["Adj Close"].pct_change().dropna()
        if not daily_returns.empty:
            expected_return = float(daily_returns.mean() * 252)
            volatility = float(daily_returns.std() * (252 ** 0.5))
except Exception as e:
    st.warning(f"Data retrieval failed: {e}")

st.write(f"Expected annual return: {expected_return:.2%}")
st.write(f"Annual volatility: {volatility:.2%}")
