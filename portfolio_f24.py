"""Freedom24 CSV/XLSX parsers."""

from __future__ import annotations

import pandas as pd
from typing import Dict


# Helpers -----------------------------------------------------------------

def _load_file(file) -> pd.DataFrame:
    """Load CSV or XLSX into a DataFrame."""

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


# Public API ---------------------------------------------------------------

def read_positions(file, mapping: Dict[str, str] | None = None) -> pd.DataFrame:
    """Read positions from Freedom24 export.

    Expected columns are 'ticker' and 'ending balance'.  Only rows with positive
    share count are returned.
    """

    df = _clean_columns(_load_file(file))
    ticker_col = next((c for c in df.columns if "ticker" in c), None)
    shares_col = next((c for c in df.columns if "ending" in c and "balance" in c), None)
    if ticker_col is None or shares_col is None:
        return pd.DataFrame(columns=["Ticker", "Shares"])
    df = df[[ticker_col, shares_col]].rename(columns={ticker_col: "Ticker", shares_col: "Shares"})
    df["Shares"] = pd.to_numeric(df["Shares"], errors="coerce")
    df = df[df["Shares"] > 0]
    if mapping:
        df["Ticker"] = df["Ticker"].map(lambda t: mapping.get(t, t))
    return df


def read_trades(file) -> pd.DataFrame | None:
    """Read and normalise trades from Freedom24 export."""

    df = _clean_columns(_load_file(file))
    if df.empty:
        return None

    rename_map = {
        "ticker": "Ticker",
        "operation": "Side",
        "quantity": "Qty",
        "price": "Price",
        "currency": "Currency",
        "amount": "Amount",
        "fee": "Fee",
        "fee currency": "FeeCurrency",
        "realized pnl": "RealizedPL",
        "trade date": "TradeDate",
        "date": "TradeDate",
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

