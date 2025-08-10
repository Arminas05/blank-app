"""Interactive Brokers CSV/XLSX parsers."""

from __future__ import annotations

import pandas as pd
from typing import Dict


def _load_file(file) -> pd.DataFrame:
    if isinstance(file, (str, bytes, bytearray)):
        path = file
    else:
        path = file
    try:
        return pd.read_csv(path)
    except Exception:
        return pd.read_excel(path)


def _clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.replace("\xa0", " ").replace("\n", " ").strip().lower() for c in df.columns]
    return df


def read_positions(file, mapping: Dict[str, str] | None = None) -> pd.DataFrame:
    """Read positions from an IBKR export."""

    df = _clean_columns(_load_file(file))
    ticker_col = next((c for c in df.columns if "symbol" in c or "ticker" in c), None)
    shares_col = next((c for c in df.columns if "quantity" in c or "shares" in c), None)
    if ticker_col is None or shares_col is None:
        # attempt to fallback to first two columns that look numeric
        if len(df.columns) >= 2:
            ticker_col, shares_col = df.columns[:2]
        else:
            return pd.DataFrame(columns=["Ticker", "Shares"])
    df = df[[ticker_col, shares_col]].rename(columns={ticker_col: "Ticker", shares_col: "Shares"})
    df["Shares"] = pd.to_numeric(df["Shares"], errors="coerce")
    df = df[df["Shares"] > 0]
    if mapping:
        df["Ticker"] = df["Ticker"].map(lambda t: mapping.get(t, t))
    return df


def read_trades(file) -> pd.DataFrame | None:
    """Read trade history from IBKR export."""

    df = _clean_columns(_load_file(file))
    if df.empty:
        return None

    rename_map = {
        "symbol": "Ticker",
        "ticker": "Ticker",
        "buy/sell": "Side",
        "quantity": "Qty",
        "shares": "Qty",
        "price": "Price",
        "currency": "Currency",
        "amount": "Amount",
        "commission": "Fee",
        "fee": "Fee",
        "fee currency": "FeeCurrency",
        "realized pnl": "RealizedPL",
        "trade date": "TradeDate",
        "date/time": "TradeDate",
    }
    mapped = {}
    for col in df.columns:
        key = col.lower()
        if key in rename_map:
            mapped[col] = rename_map[key]
    df = df.rename(columns=mapped)
    for c in ["Ticker", "Side", "Qty", "Price", "Currency", "Amount", "Fee", "FeeCurrency", "RealizedPL", "TradeDate"]:
        if c not in df:
            df[c] = pd.NA
    return df[["Ticker", "Side", "Qty", "Price", "Currency", "Amount", "Fee", "FeeCurrency", "RealizedPL", "TradeDate"]]

