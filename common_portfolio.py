"""Common portfolio helpers for broker exports.

This module provides utilities to map broker symbols to Yahoo Finance tickers,
fetch live prices and foreign exchange rates and build a valuation table used by
multiple importer modules.  Functions are intentionally lightweight and contain
basic error handling so the Streamlit application keeps running even when
network requests fail.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Dict, Iterable, Tuple

import numpy as np
import pandas as pd
import yfinance as yf


BROKER_SUFFIXES = [
    ".US",
    ".EU",
    ".DE",
    ".L",
    ".KZ.KZ",
]


def default_symbol_guess(broker_symbol: str) -> str:
    """Return a naive Yahoo ticker guess for a broker specific symbol.

    The algorithm removes common suffixes and whitespace and replaces slashes
    with dashes.  It is intentionally simple but works for the majority of
    Freedom24/IBKR symbols.
    """

    symbol = broker_symbol.strip().upper()
    for suf in BROKER_SUFFIXES:
        if symbol.endswith(suf):
            symbol = symbol[: -len(suf)]
            break
    symbol = symbol.replace("/", "-").replace(" ", "")
    return symbol


def load_symbol_map(path: str = "symbol_map.json") -> Dict[str, str]:
    """Load user defined symbol mapping from JSON file.

    Parameters
    ----------
    path: str
        Location of the JSON mapping file.
    """

    p = Path(path)
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError:
        return {}


def save_symbol_map(mapping: Dict[str, str], path: str = "symbol_map.json") -> None:
    """Persist mapping dictionary to ``path`` as JSON."""

    p = Path(path)
    p.write_text(json.dumps(mapping, indent=2, sort_keys=True))


def _fx_table() -> Dict[Tuple[str, str], float]:
    """Create a minimal FX conversion table using the EURUSD pair.

    The table provides USD→EUR and EUR→USD multipliers.  If the download fails
    we fall back to 1:1 to keep the UI usable without crashing.
    """

    try:
        fx = yf.download("EURUSD=X", period="1d", auto_adjust=True, progress=False)
        rate = float(fx["Close"].iloc[-1])
    except Exception:
        rate = 1.0
    return {
        ("EUR", "USD"): rate,
        ("USD", "EUR"): 1.0 / rate if rate else 1.0,
    }


def to_display(amount: float, src_ccy: str, display_ccy: str, table: Dict[Tuple[str, str], float]) -> float:
    """Convert ``amount`` from ``src_ccy`` into ``display_ccy`` using ``table``."""

    if src_ccy == display_ccy:
        return float(amount)
    return float(amount) * table.get((src_ccy, display_ccy), 1.0)


def fetch_prices(
    broker_tickers: Iterable[str],
    symbol_map: Dict[str, str] | None = None,
) -> Dict[str, float]:
    """Fetch last USD prices for broker tickers.

    ``symbol_map`` maps broker symbols to Yahoo tickers.  When not provided a
    :func:`default_symbol_guess` is used.
    """

    broker_tickers = list(broker_tickers)
    mapping = {t: symbol_map.get(t, default_symbol_guess(t)) if symbol_map else default_symbol_guess(t) for t in broker_tickers}
    yahoo_symbols = list(mapping.values())
    prices: Dict[str, float] = {}
    try:
        data = yf.download(",".join(yahoo_symbols), period="1d", auto_adjust=True, progress=False)["Close"].iloc[-1]
        if isinstance(data, pd.Series):
            for b, y in mapping.items():
                if y in data and not np.isnan(data[y]):
                    prices[b] = float(data[y])
        else:
            # single symbol
            prices[broker_tickers[0]] = float(data)
    except Exception:
        data = pd.Series(dtype=float)

    # fallback per ticker
    for b, y in mapping.items():
        if b in prices:
            continue
        try:
            hist = yf.Ticker(y).history(period="1d", auto_adjust=True)
            prices[b] = float(hist["Close"].iloc[-1])
        except Exception:
            prices[b] = float("nan")
    return prices


def build_portfolio(
    df_pos: pd.DataFrame,
    symbol_map: Dict[str, str] | None,
    display_ccy: str = "USD",
) -> Tuple[pd.DataFrame, float, Dict[str, float]]:
    """Return enriched positions, total value and price dictionary."""

    if df_pos.empty:
        return df_pos, 0.0, {}

    prices = fetch_prices(df_pos["Ticker"].tolist(), symbol_map)
    fx = _fx_table()
    rows = []
    total = 0.0
    for _, row in df_pos.iterrows():
        ticker = row["Ticker"]
        shares = float(row.get("Shares", 0))
        price = prices.get(ticker, np.nan)
        value = shares * price
        value_disp = to_display(value, "USD", display_ccy, fx)
        rows.append({
            "Ticker": ticker,
            "Shares": shares,
            "Price": to_display(price, "USD", display_ccy, fx),
            "Value": value_disp,
        })
        total += value_disp
    df = pd.DataFrame(rows)
    return df, float(total), prices


def summarize_trades(trades: pd.DataFrame | None, display_ccy: str = "USD") -> Dict[str, float]:
    """Aggregate trade values, fees and realized P/L.

    Parameters
    ----------
    trades: DataFrame | None
        Trade history normalised to standard columns.
    display_ccy: str
        Currency for the resulting summary.
    """

    summary = {"fees": 0.0, "buys": 0.0, "sells": 0.0, "realized_pl": 0.0}
    if trades is None or trades.empty:
        return summary

    fx = _fx_table()
    for _, row in trades.iterrows():
        qty = float(row.get("Qty", 0))
        price = float(row.get("Price", row.get("Amount", 0)))
        value = qty * price if price else float(row.get("Amount", 0))
        summary_key = "buys" if str(row.get("Side", "")).upper().startswith("B") else "sells"
        src_ccy = row.get("Currency", "USD")
        summary[summary_key] += to_display(value, src_ccy, display_ccy, fx)
        fee = float(row.get("Fee", 0))
        fee_ccy = row.get("FeeCurrency", src_ccy)
        summary["fees"] += to_display(fee, fee_ccy, display_ccy, fx)
        summary["realized_pl"] += to_display(float(row.get("RealizedPL", 0)), src_ccy, display_ccy, fx)
    for k in summary:
        summary[k] = float(summary[k])
    return summary

