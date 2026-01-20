"""
Data Pipeline Utilities - Clean Data Preparation Without Data Leakage

This module provides utility functions for downloading, validating, and preparing
stock data for both backtesting and future predictions while ensuring no data leakage.

Key Principle: Scaler must ONLY be fitted on training data, never on test data.
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime


def download_stock_data(ticker, years=10):
    """
    Download historical stock data with validation.

    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL', 'MSFT')
        years (int): Number of years of historical data (default: 10)

    Returns:
        pd.DataFrame: DataFrame with Date index and OHLCV columns

    Raises:
        ValueError: If ticker not found or no data available
    """
    now = datetime.now()
    start = datetime(now.year - years, now.month, now.day)

    # Download data
    df = yf.download(ticker, start=start, end=now, progress=False)

    if df.empty:
        raise ValueError(
            f"Ticker '{ticker}' not found or no data available. "
            f"Verify ticker symbol is correct (e.g., AAPL, TSLA, MSFT)."
        )

    # Handle MultiIndex columns (occurs when downloading single ticker)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # Validate minimum data requirements
    min_days = 200  # Need 100 for sequence + at least 100 for training
    if len(df) < min_days:
        raise ValueError(
            f"Insufficient data for ticker '{ticker}': {len(df)} days available, "
            f"minimum {min_days} required (100 for LSTM sequence + training data)."
        )

    return df


def prepare_backtesting_data(close_prices, train_ratio=0.7):
    """
    Split data into train/test WITHOUT data leakage.

    This function ensures clean separation between training and testing periods.
    The scaler should ONLY be fitted on the returned 'train' series.

    Args:
        close_prices (pd.Series): Time series of closing prices
        train_ratio (float): Ratio of data to use for training (default: 0.7)

    Returns:
        dict: Dictionary containing:
            - 'train': pd.Series of training data
            - 'test': pd.Series of testing data
            - 'past_100': pd.Series of last 100 days from training (for sequence init)
            - 'split_idx': int index where split occurs

    Example:
        >>> data_split = prepare_backtesting_data(close_prices)
        >>> scaler.fit(data_split['train'].values.reshape(-1, 1))  # ✓ CORRECT
        >>> scaler.fit(pd.concat([data_split['train'], data_split['test']]))  # ✗ LEAKAGE!
    """
    if not isinstance(close_prices, pd.Series):
        raise TypeError(
            f"Expected pd.Series, got {type(close_prices)}. "
            f"Use df['Close'] to extract series."
        )

    if len(close_prices) < 200:
        raise ValueError(
            f"Insufficient data: {len(close_prices)} days, minimum 200 required."
        )

    # Calculate split index
    split_idx = int(len(close_prices) * train_ratio)

    # Ensure at least 100 days in test set (for LSTM sequence)
    if len(close_prices) - split_idx < 100:
        split_idx = len(close_prices) - 100

    # Split data
    train = close_prices[:split_idx]
    test = close_prices[split_idx:]

    # Get last 100 days of training for sequence initialization
    past_100 = train.tail(100)

    return {
        'train': train,
        'test': test,
        'past_100': past_100,
        'split_idx': split_idx
    }


def create_sequences(data, sequence_length=100):
    """
    Create LSTM input sequences (X, y pairs) from scaled data.

    This function implements a sliding window approach where each X is a sequence
    of 'sequence_length' consecutive values, and y is the next value.

    Args:
        data (np.ndarray): Scaled data array, shape (n_samples, 1)
        sequence_length (int): Length of input sequence (default: 100)

    Returns:
        tuple: (X, y) where:
            - X: np.ndarray of shape (n_sequences, sequence_length, 1)
            - y: np.ndarray of shape (n_sequences,)

    Example:
        Given prices: [10, 20, 30, 40, 50] and sequence_length=3:
        X[0] = [10, 20, 30], y[0] = 40
        X[1] = [20, 30, 40], y[1] = 50
    """
    if len(data) < sequence_length + 1:
        raise ValueError(
            f"Insufficient data for sequences: {len(data)} samples, "
            f"need at least {sequence_length + 1}"
        )

    X, y = [], []

    for i in range(sequence_length, data.shape[0]):
        # X: previous 'sequence_length' values
        X.append(data[i - sequence_length:i, 0])
        # y: next value
        y.append(data[i, 0])

    X = np.array(X)
    y = np.array(y)

    # Reshape X for LSTM input: (n_sequences, sequence_length, 1)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    return X, y


def validate_data_quality(close_prices):
    """
    Validate data quality and check for anomalies.

    Args:
        close_prices (pd.Series): Closing prices series

    Returns:
        dict: Validation results with warnings

    Raises:
        ValueError: If data has critical issues (e.g., all NaN)
    """
    results = {
        'valid': True,
        'warnings': [],
        'info': {}
    }

    # Check for NaN values
    nan_count = close_prices.isna().sum()
    if nan_count > 0:
        nan_pct = (nan_count / len(close_prices)) * 100
        if nan_pct > 5:
            results['valid'] = False
            results['warnings'].append(
                f"High NaN percentage: {nan_pct:.1f}% ({nan_count} values)"
            )
        else:
            results['warnings'].append(
                f"Contains {nan_count} NaN values ({nan_pct:.1f}%), will be forward-filled"
            )

    # Check for inf values
    if np.any(np.isinf(close_prices)):
        results['valid'] = False
        results['warnings'].append("Data contains infinite values")

    # Check for negative prices
    if (close_prices < 0).any():
        results['valid'] = False
        results['warnings'].append("Data contains negative prices")

    # Check for zero prices
    zero_count = (close_prices == 0).sum()
    if zero_count > 0:
        results['warnings'].append(
            f"Contains {zero_count} zero price values (possible data error)"
        )

    # Data statistics
    results['info'] = {
        'length': len(close_prices),
        'min': float(close_prices.min()),
        'max': float(close_prices.max()),
        'mean': float(close_prices.mean()),
        'std': float(close_prices.std())
    }

    return results


def check_data_range_compatibility(train_data, test_data, threshold=0.2):
    """
    Check if test data range is compatible with training data range.

    Warns if test data falls significantly outside training range, as this
    may lead to unreliable predictions (extrapolation vs interpolation).

    Args:
        train_data (pd.Series): Training data
        test_data (pd.Series): Testing data
        threshold (float): Threshold for warning (default: 0.2 = 20%)

    Returns:
        dict: Compatibility check results
    """
    train_min, train_max = train_data.min(), train_data.max()
    test_min, test_max = test_data.min(), test_data.max()

    train_range = train_max - train_min
    lower_bound = train_min - (threshold * train_range)
    upper_bound = train_max + (threshold * train_range)

    results = {
        'compatible': True,
        'warnings': []
    }

    if test_min < lower_bound:
        results['compatible'] = False
        results['warnings'].append(
            f"Test data minimum (${test_min:.2f}) is {((train_min - test_min) / train_range * 100):.1f}% "
            f"below training range (${train_min:.2f} - ${train_max:.2f}). "
            f"Predictions may be unreliable (extrapolation)."
        )

    if test_max > upper_bound:
        results['compatible'] = False
        results['warnings'].append(
            f"Test data maximum (${test_max:.2f}) is {((test_max - train_max) / train_range * 100):.1f}% "
            f"above training range (${train_min:.2f} - ${train_max:.2f}). "
            f"Predictions may be unreliable (extrapolation)."
        )

    return results
