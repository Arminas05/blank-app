"""Simple vectorised backtest engine."""

from __future__ import annotations

from collections import namedtuple
from typing import Dict, Iterable, List

import numpy as np
import pandas as pd
import yfinance as yf

try:
    from numba import njit
    NUMBA = True
except Exception:  # pragma: no cover - numba optional
    NUMBA = False


def update_prices(tickers: List[str], start: str = "2010-01-01", freq: str = "Monthly") -> pd.DataFrame:
    """Download adjusted close prices for ``tickers`` starting at ``start``."""

    freq_map = {"Monthly": "1mo", "Weekly": "1wk", "Daily": "1d"}
    interval = freq_map.get(freq, "1mo")
    data = yf.download(tickers, start=start, interval=interval, auto_adjust=True, progress=False)
    if isinstance(data, pd.Series):  # single ticker
        data = data.to_frame(name=tickers[0])
    else:
        data = data["Close"]
    data.index.name = "Date"
    return data.dropna(how="all")


Perf = namedtuple("Perf", "cagr max_dd longest_dd_m win_months")


def _backtest_numpy(
    rets: np.ndarray,
    weights: np.ndarray,
    gates: np.ndarray,
    cash_r: float,
) -> np.ndarray:
    eq = np.ones(rets.shape[0] + 1, dtype=np.float64)
    for t in range(rets.shape[0]):
        active_w = weights * gates[t]
        w_sum = active_w.sum()
        r = (active_w * rets[t]).sum() + (1.0 - w_sum) * cash_r
        eq[t + 1] = eq[t] * (1.0 + r)
    return eq


if NUMBA:  # pragma: no cover - optional acceleration
    _backtest_numpy = njit(_backtest_numpy)  # type: ignore


def backtest(
    px: pd.DataFrame,
    weights: Dict[str, float],
    gated_sleeves: List[str],
    ma_len: int = 10,
    trend_thresh: float = 0.0,
    late_inception: bool = True,
    cash_yield: float = 0.04,
    freq: str = "Monthly",
):
    """Run a simple sleeves backtest.

    Returns a tuple ``(trend_df, equity, drawdown, Perf)``.
    """

    freq_map = {"Monthly": 12, "Weekly": 52, "Daily": 252}
    periods_per_year = freq_map.get(freq, 12)

    px = px[sorted(weights.keys())].copy()
    rets = px.pct_change().dropna()
    sma = px.rolling(ma_len).mean()
    gate = (px >= (sma + trend_thresh)).astype(int)
    for col in px.columns:
        if col not in gated_sleeves:
            gate[col] = 1
    if late_inception:
        for col in px.columns:
            first_valid = px[col].first_valid_index()
            if first_valid is not None:
                gate.loc[: first_valid, col] = 0
    gate = gate.loc[rets.index]

    cash_r = (1 + cash_yield) ** (1 / periods_per_year) - 1
    w_arr = np.array([weights[c] for c in px.columns], dtype=np.float64)
    r_arr = rets.to_numpy(dtype=np.float64)
    g_arr = gate.to_numpy(dtype=np.float64)
    eq = _backtest_numpy(r_arr, w_arr, g_arr, cash_r)
    equity = pd.Series(eq[1:], index=rets.index)
    peak = equity.cummax()
    dd = equity / peak - 1

    # stats
    n_periods = len(equity)
    cagr = equity.iloc[-1] ** (periods_per_year / n_periods) - 1
    max_dd = dd.min()
    neg = dd < 0
    longest = 0
    current = 0
    for v in neg:
        if v:
            current += 1
            longest = max(longest, current)
        else:
            current = 0
    longest_dd_m = longest * 12 / periods_per_year
    win_months = float((rets.sum(axis=1) > 0).mean())
    perf = Perf(cagr=cagr, max_dd=max_dd, longest_dd_m=longest_dd_m, win_months=win_months)

    return gate, equity, dd, perf

