"""Streamlit application for portfolio analysis."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st

import common_portfolio as cp
import engine_v4 as engine
import portfolio_f24 as f24
import portfolio_ibkr as ibkr
import yfinance as yf

try:  # optional plotly import
    import plotly.express as px
    PLOTLY = True
except Exception:  # pragma: no cover
    PLOTLY = False


# ---------------------------------------------------------------------------
# UI helpers
# ---------------------------------------------------------------------------

st.set_page_config(page_title="Trend", layout="wide")

# inject cyber styling
try:
    st.markdown(Path(".streamlit/cyber.css").read_text(), unsafe_allow_html=True)
except Exception:
    pass


def allocation_chart(df: pd.DataFrame):
    top = df.sort_values("Value", ascending=False).head(12)
    if PLOTLY:
        fig = px.pie(top, values="Value", names="Ticker")
        fig.update_layout(margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.write(top.set_index("Ticker")[["Value"]])


# Sidebar ------------------------------------------------------------------

display_ccy = st.sidebar.selectbox("Display currency", ["USD", "EUR"], index=0)
start_date = st.sidebar.date_input("Start date", pd.to_datetime("2015-01-01"))
freq = st.sidebar.selectbox("Backtest frequency", ["Monthly", "Weekly", "Daily"], index=0)
cash_yield = st.sidebar.number_input("Cash yield", value=0.04, step=0.01, format="%.2f")

if "symbol_map" not in st.session_state:
    st.session_state.symbol_map = cp.load_symbol_map()

# Tabs ---------------------------------------------------------------------

tab_sync, tab_dash, tab_bt, tab_mc, tab_settings = st.tabs(
    ["Portfolio Sync", "Dashboard", "Backtest", "DCA Monte Carlo", "Settings"]
)


with tab_sync:
    st.header("Portfolio Sync")
    broker = st.selectbox("Broker", ["Freedom24", "IBKR"])
    file = st.file_uploader("Upload positions/trades file", type=["csv", "xlsx", "xls"])

    if file is not None:
        if broker == "Freedom24":
            df_pos = f24.read_positions(file)
            trades = f24.read_trades(file)
        else:
            df_pos = ibkr.read_positions(file)
            trades = ibkr.read_trades(file)

        st.subheader("Symbol mapping")
        for ticker in df_pos["Ticker"].unique():
            guess = st.session_state.symbol_map.get(ticker, cp.default_symbol_guess(ticker))
            st.session_state.symbol_map[ticker] = st.text_input(f"{ticker}", guess)
        if st.button("Save mapping"):
            cp.save_symbol_map(st.session_state.symbol_map)
            st.success("Mapping saved")

        positions, total, prices = cp.build_portfolio(df_pos, st.session_state.symbol_map, display_ccy)
        st.session_state.positions = positions
        st.session_state.total = total
        st.session_state.prices = prices
        st.dataframe(positions)

        trades_summary = cp.summarize_trades(trades, display_ccy)
        st.session_state.trades = trades
        st.session_state.trades_summary = trades_summary
        if trades is not None:
            st.write(trades.tail())
        st.write(trades_summary)

with tab_dash:
    st.header("Dashboard")
    if "positions" in st.session_state:
        positions = st.session_state.positions
        total = st.session_state.total
        summary = st.session_state.get("trades_summary", {"buys":0,"sells":0,"fees":0})
        invested = max(summary.get("buys",0) + summary.get("fees",0) - summary.get("sells",0), 0)
        unreal = total - invested
        cols = st.columns(3)
        cols[0].metric("Total value", f"{total:,.2f} {display_ccy}")
        cols[1].metric("Invested≈", f"{invested:,.2f} {display_ccy}")
        cols[2].metric("Fees", f"{summary.get('fees',0):,.2f} {display_ccy}")
        st.metric("Unrealized P/L", f"{unreal:,.2f} {display_ccy}")
        allocation_chart(positions)
    else:
        st.info("Upload portfolio first")

with tab_bt:
    st.header("Backtest")
    if "positions" in st.session_state:
        tickers = [st.session_state.symbol_map.get(t, cp.default_symbol_guess(t)) for t in st.session_state.positions["Ticker"]]
        if st.button("Run backtest"):
            px_data = engine.update_prices(tickers, start=str(start_date), freq=freq)
            weights = {t: 1.0 / len(tickers) for t in tickers}
            gate, equity, dd, perf = engine.backtest(px_data, weights, tickers, late_inception=True, cash_yield=cash_yield, freq=freq)
            st.write(perf)
            if PLOTLY:
                st.plotly_chart(px.line(equity, labels={"value": "Equity"}), use_container_width=True)
                st.plotly_chart(px.line(dd, labels={"value": "Drawdown"}), use_container_width=True)
            else:
                st.line_chart(equity)
                st.line_chart(dd)
    else:
        st.info("Upload portfolio first")

with tab_mc:
    st.header("DCA Monte Carlo")
    symbol = st.text_input("Yahoo symbol", "SPY")
    contrib = st.number_input("Monthly contribution", value=100.0)
    years = st.number_input("Years", value=10, step=1)
    sims = st.number_input("Simulations", value=1000, min_value=1000, max_value=50000, step=1000)
    pct_input = st.text_input("Percentiles comma separated", "5,50,95")
    percentiles = [float(p.strip()) for p in pct_input.split(",") if p.strip()]
    if st.button("Run simulation"):
        data = yf.download(symbol, period="max", interval="1mo", auto_adjust=True, progress=False)
        returns = data["Close"].pct_change().dropna().to_numpy(dtype=np.float32)
        months = int(years * 12)
        sims = int(sims)
        chunk = 5000
        results = []
        for _ in range(0, sims, chunk):
            n = min(chunk, sims - len(results))
            idx = np.random.randint(0, len(returns), size=(n, months))
            sampled = returns[idx]
            eq = np.zeros((n, months + 1), dtype=np.float32)
            for i in range(months):
                eq[:, i + 1] = eq[:, i] * (1 + sampled[:, i]) + contrib
            results.append(eq[:, -1])
        values = np.concatenate(results)
        st.write(pd.Series(values).describe(percentiles=[p / 100 for p in percentiles]))
        if PLOTLY:
            st.plotly_chart(px.histogram(values, nbins=50), use_container_width=True)
        else:
            st.write(values)

with tab_settings:
    st.header("Settings")
    st.write("Theme configured via .streamlit/config.toml")
    st.write("Symbol map path:", Path("symbol_map.json").resolve())
    st.write("Optional libraries: plotly, numba")

