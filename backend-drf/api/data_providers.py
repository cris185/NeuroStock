"""
Data Providers Abstraction Layer

Supports multiple stock data providers with a common interface.

Providers:
- YFinanceProvider (default, no API key required)
- YahooQueryProvider (silent fallback, no API key required)
- AlphaVantageProvider (requires API key, 25 req/day free tier)
- FinnhubProvider (requires API key, 60 calls/min free, real-time quotes)

Usage:
    from .data_providers import get_provider_with_fallback, get_realtime_provider
    df = get_provider_with_fallback('AAPL', user=request.user)
    quote = get_realtime_provider(user=request.user).get_quote('AAPL')
"""

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from datetime import datetime, timedelta


class BaseDataProvider(ABC):
    name = 'base'

    @abstractmethod
    def get_historical(self, ticker: str, years: int = 10) -> pd.DataFrame:
        """Get historical OHLCV data. Must return DataFrame with 'Close' column."""
        pass

    @abstractmethod
    def get_quote(self, ticker: str) -> dict:
        """
        Get current quote.
        Returns: {price, change, change_pct, volume, timestamp, is_delayed, provider}
        """
        pass

    def get_intraday(self, ticker: str, interval: str = '5') -> pd.DataFrame:
        """Get intraday data — not all providers support this."""
        raise NotImplementedError(
            f"{self.__class__.__name__} does not support intraday data."
        )

    def validate_key(self) -> bool:
        """Validate API key. Defaults to True for providers without keys."""
        return True


class YFinanceProvider(BaseDataProvider):
    name = 'yfinance'

    def get_historical(self, ticker: str, years: int = 10) -> pd.DataFrame:
        import yfinance as yf
        end = datetime.now()
        start = end - timedelta(days=years * 365)
        df = yf.download(
            ticker, start=start.strftime('%Y-%m-%d'),
            end=end.strftime('%Y-%m-%d'), progress=False, auto_adjust=True
        )
        if df.empty:
            raise ValueError(
                f"Ticker '{ticker}' not found or no data available via yfinance."
            )
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        if 'Close' not in df.columns:
            raise ValueError(f"No Close price data for ticker '{ticker}'.")
        return df

    def get_quote(self, ticker: str) -> dict:
        import yfinance as yf
        t = yf.Ticker(ticker)
        info = t.fast_info
        price = float(info.last_price) if hasattr(info, 'last_price') and info.last_price else None
        prev_close = float(info.previous_close) if hasattr(info, 'previous_close') and info.previous_close else None
        if price is None:
            raise ValueError(f"Could not get quote for '{ticker}' via yfinance.")
        change = round(price - prev_close, 2) if prev_close else 0.0
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0
        volume = None
        try:
            volume = int(info.three_month_average_volume) if hasattr(info, 'three_month_average_volume') else None
        except Exception:
            pass
        return {
            'price': round(price, 2),
            'change': change,
            'change_pct': change_pct,
            'volume': volume,
            'timestamp': datetime.now().isoformat(),
            'is_delayed': True,
            'provider': 'yfinance',
        }


class YahooQueryProvider(BaseDataProvider):
    """
    Fallback provider using yahooquery, which hits Yahoo Finance's API directly
    (more stable than yfinance's scraping approach).
    """
    name = 'yahooquery'

    def get_historical(self, ticker: str, years: int = 10) -> pd.DataFrame:
        from yahooquery import Ticker
        end = datetime.now()
        start = end - timedelta(days=years * 365)
        t = Ticker(ticker)
        df = t.history(
            start=start.strftime('%Y-%m-%d'),
            end=end.strftime('%Y-%m-%d')
        )
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            raise ValueError(f"No data found for ticker '{ticker}' via yahooquery.")
        if isinstance(df.index, pd.MultiIndex):
            df = df.droplevel(0)
        df.index = pd.to_datetime(df.index)
        df.columns = [c.capitalize() for c in df.columns]
        if 'Close' not in df.columns:
            col_map = {c: c.capitalize() for c in df.columns}
            df = df.rename(columns=col_map)
        return df

    def get_quote(self, ticker: str) -> dict:
        from yahooquery import Ticker
        t = Ticker(ticker)
        price_data = t.price.get(ticker, {})
        if isinstance(price_data, str):
            raise ValueError(f"Could not get quote for '{ticker}' via yahooquery.")
        price = price_data.get('regularMarketPrice')
        if price is None:
            raise ValueError(f"Could not get quote for '{ticker}' via yahooquery.")
        change = price_data.get('regularMarketChange', 0.0)
        change_pct = price_data.get('regularMarketChangePercent', 0.0)
        volume = price_data.get('regularMarketVolume')
        return {
            'price': round(float(price), 2),
            'change': round(float(change), 2),
            'change_pct': round(float(change_pct) * 100, 2),
            'volume': int(volume) if volume else None,
            'timestamp': datetime.now().isoformat(),
            'is_delayed': True,
            'provider': 'yahooquery',
        }


class AlphaVantageProvider(BaseDataProvider):
    """
    Alpha Vantage provider — requires a free API key (25 req/day).
    Best for reliable historical data (20+ years).
    """
    name = 'alphavantage'

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_historical(self, ticker: str, years: int = 10) -> pd.DataFrame:
        from alpha_vantage.timeseries import TimeSeries
        ts = TimeSeries(key=self.api_key, output_format='pandas')
        data, _ = ts.get_daily_adjusted(symbol=ticker, outputsize='full')
        if data.empty:
            raise ValueError(
                f"No data found for ticker '{ticker}' via Alpha Vantage. "
                f"Ensure the ticker is valid and your API key is correct."
            )
        data = data.sort_index()
        cutoff = datetime.now() - timedelta(days=years * 365)
        data = data[data.index >= cutoff.strftime('%Y-%m-%d')]
        data = data.rename(columns={
            '1. open': 'Open',
            '2. high': 'High',
            '3. low': 'Low',
            '4. close': 'Close',
            '5. adjusted close': 'Adj Close',
            '6. volume': 'Volume',
            '7. dividend amount': 'Dividends',
            '8. split coefficient': 'Stock Splits',
        })
        return data

    def get_quote(self, ticker: str) -> dict:
        from alpha_vantage.timeseries import TimeSeries
        ts = TimeSeries(key=self.api_key)
        data, _ = ts.get_quote_endpoint(symbol=ticker)
        price = float(data.get('05. price', 0))
        change = float(data.get('09. change', 0))
        change_pct_str = data.get('10. change percent', '0%').replace('%', '')
        try:
            change_pct = float(change_pct_str)
        except (ValueError, TypeError):
            change_pct = 0.0
        volume = int(data.get('06. volume', 0))
        if price == 0:
            raise ValueError(f"Could not get quote for '{ticker}' via Alpha Vantage.")
        return {
            'price': round(price, 2),
            'change': round(change, 2),
            'change_pct': round(change_pct, 2),
            'volume': volume,
            'timestamp': datetime.now().isoformat(),
            'is_delayed': True,
            'provider': 'alphavantage',
        }

    def validate_key(self) -> bool:
        try:
            from alpha_vantage.timeseries import TimeSeries
            ts = TimeSeries(key=self.api_key)
            data, _ = ts.get_quote_endpoint(symbol='IBM')
            return bool(data.get('05. price'))
        except Exception:
            return False


class FinnhubProvider(BaseDataProvider):
    """
    Finnhub provider — requires a free API key (60 calls/min).
    The ONLY free provider with genuinely real-time stock quotes.
    Used primarily for the live quote widget.
    """
    name = 'finnhub'

    def __init__(self, api_key: str):
        self.api_key = api_key

    def get_historical(self, ticker: str, years: int = 10) -> pd.DataFrame:
        """Finnhub free tier has limited history. Falls back to yfinance for historical data."""
        return YFinanceProvider().get_historical(ticker, years)

    def get_quote(self, ticker: str) -> dict:
        import finnhub
        client = finnhub.Client(api_key=self.api_key)
        data = client.quote(ticker)
        price = data.get('c', 0)
        if price == 0:
            raise ValueError(f"Could not get real-time quote for '{ticker}' via Finnhub.")
        change = data.get('d', 0)
        change_pct = data.get('dp', 0)
        return {
            'price': round(float(price), 2),
            'change': round(float(change), 2),
            'change_pct': round(float(change_pct), 2),
            'volume': None,
            'high': round(float(data.get('h', 0)), 2),
            'low': round(float(data.get('l', 0)), 2),
            'open': round(float(data.get('o', 0)), 2),
            'prev_close': round(float(data.get('pc', 0)), 2),
            'timestamp': datetime.now().isoformat(),
            'is_delayed': False,
            'provider': 'finnhub',
        }

    def get_intraday(self, ticker: str, interval: str = '5') -> pd.DataFrame:
        import finnhub
        import time
        client = finnhub.Client(api_key=self.api_key)
        end_ts = int(time.time())
        start_ts = end_ts - 86400  # last 24 hours
        candles = client.stock_candles(ticker, interval, start_ts, end_ts)
        if candles.get('s') != 'ok':
            raise ValueError(
                f"No intraday data available for '{ticker}'. "
                f"The market may be closed or ticker may be invalid."
            )
        df = pd.DataFrame({
            'Open': candles['o'],
            'High': candles['h'],
            'Low': candles['l'],
            'Close': candles['c'],
            'Volume': candles['v'],
        }, index=pd.to_datetime(candles['t'], unit='s'))
        df.index.name = 'Date'
        return df

    def validate_key(self) -> bool:
        try:
            import finnhub
            client = finnhub.Client(api_key=self.api_key)
            data = client.quote('AAPL')
            # 't' (timestamp) is always present in a valid response, even when market is closed.
            # An invalid key raises a FinnhubAPIException (403/401) caught below.
            return isinstance(data, dict) and 't' in data
        except Exception:
            return False


def get_historical_provider(user=None) -> BaseDataProvider:
    """
    Get the provider for historical data based on user config.
    Priority: User's active non-Finnhub provider → YFinanceProvider (default)
    """
    if user and user.is_authenticated:
        try:
            from .models import ProviderConfig
            config = ProviderConfig.objects.filter(
                user=user, is_active=True, is_valid=True
            ).exclude(provider='finnhub').first()
            if config:
                if config.provider == 'alphavantage' and config.api_key:
                    return AlphaVantageProvider(config.api_key)
        except Exception:
            pass
    return YFinanceProvider()


def get_realtime_provider(user=None) -> BaseDataProvider:
    """
    Get the provider for real-time/quote data based on user config.
    Priority: Finnhub (if user has key) → YFinanceProvider
    """
    if user and user.is_authenticated:
        try:
            from .models import ProviderConfig
            config = ProviderConfig.objects.filter(
                user=user, provider='finnhub', is_valid=True
            ).first()
            if config and config.api_key:
                return FinnhubProvider(config.api_key)
        except Exception:
            pass
    return YFinanceProvider()


def get_provider_with_fallback(ticker: str, user=None, years: int = 10) -> pd.DataFrame:
    """
    Download historical data with automatic yahooquery fallback if primary provider fails.
    This is the main entry point for all historical data downloads.
    """
    provider = get_historical_provider(user)
    try:
        return provider.get_historical(ticker, years)
    except Exception as primary_error:
        if not isinstance(provider, (YahooQueryProvider, YFinanceProvider)):
            raise primary_error
        if isinstance(provider, YFinanceProvider):
            try:
                return YahooQueryProvider().get_historical(ticker, years)
            except Exception:
                raise primary_error
        raise primary_error
