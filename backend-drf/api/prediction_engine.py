"""
Future Prediction Engine - Recursive Prediction with Uncertainty Quantification

This module implements recursive multi-step forecasting using LSTM with
Monte Carlo Dropout for uncertainty estimation.

Key Features:
- Recursive prediction: each forecast feeds into the next
- Uncertainty quantification via Monte Carlo Dropout
- Growing confidence intervals with prediction horizon
- Trading day date generation (excludes weekends)
"""

import numpy as np
from datetime import datetime, timedelta


class FuturePredictionEngine:
    """
    Engine for predicting future stock prices with uncertainty estimates.

    This class implements recursive prediction where each day's prediction
    is used as input for the next day, allowing forecasting arbitrary horizons.

    Attributes:
        model: Keras LSTM model
        scaler: MinMaxScaler fitted on training data
        sequence_length: Number of historical days required (default: 100)
    """

    def __init__(self, model, scaler, sequence_length=100):
        """
        Initialize prediction engine.

        Args:
            model: Trained Keras model
            scaler: MinMaxScaler fitted on training data only
            sequence_length (int): Sequence length for LSTM input (default: 100)
        """
        self.model = model
        self.scaler = scaler
        self.sequence_length = sequence_length

    def predict_future(self, historical_prices, horizon,
                       confidence_level=0.95, mc_iterations=50):
        """
        Predict future prices with confidence intervals.

        Uses recursive prediction: day 1 prediction feeds into day 2, etc.
        Uncertainty is quantified using Monte Carlo Dropout technique.

        Args:
            historical_prices (np.ndarray): Historical prices, shape (n_days,)
                Must have at least self.sequence_length days
            horizon (int): Number of trading days to predict (1-365)
            confidence_level (float): Confidence level for intervals (default: 0.95)
            mc_iterations (int): Monte Carlo iterations for uncertainty (default: 50)

        Returns:
            dict: Prediction results containing:
                - 'predicted_prices': List of predicted prices
                - 'lower_bound': List of lower confidence bounds
                - 'upper_bound': List of upper confidence bounds
                - 'uncertainty': List of standard deviations

        Raises:
            ValueError: If insufficient historical data or invalid parameters
        """
        # Validate inputs
        if len(historical_prices) < self.sequence_length:
            raise ValueError(
                f"Insufficient historical data: {len(historical_prices)} days provided, "
                f"minimum {self.sequence_length} required for LSTM sequence."
            )

        if not 1 <= horizon <= 365:
            raise ValueError(
                f"Invalid horizon: {horizon}. Must be between 1 and 365 days."
            )

        if not 0.80 <= confidence_level <= 0.99:
            raise ValueError(
                f"Invalid confidence level: {confidence_level}. Must be between 0.80 and 0.99."
            )

        # Initialize sequence with last 100 historical days (scaled)
        current_sequence = self.scaler.transform(
            historical_prices[-self.sequence_length:].reshape(-1, 1)
        )

        # Storage for predictions
        predictions = []
        uncertainties = []
        lower_bounds = []
        upper_bounds = []

        # Z-score for confidence intervals
        # 95% CI: z=1.96, 99% CI: z=2.576, 90% CI: z=1.645
        z_scores = {
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        }
        z_score = z_scores.get(confidence_level, 1.96)

        # Recursive prediction loop
        for day in range(horizon):
            # Monte Carlo Dropout: multiple forward passes with dropout enabled
            mc_predictions = []

            for _ in range(mc_iterations):
                # Reshape for model: (batch_size=1, sequence_length, features=1)
                X = current_sequence.reshape(1, self.sequence_length, 1)

                # Prediction with dropout active (training=True enables dropout)
                # Note: Model must have Dropout layers for this to work effectively
                try:
                    pred = self.model(X, training=True).numpy()[0, 0]
                except Exception:
                    # Fallback if training=True not supported
                    pred = self.model.predict(X, verbose=0)[0, 0]

                mc_predictions.append(pred)

            # Calculate statistics from MC samples
            mc_predictions = np.array(mc_predictions)
            mean_pred = mc_predictions.mean()
            std_pred = mc_predictions.std()

            # Increase uncertainty with prediction horizon (error accumulation)
            # Each additional day adds 2% more uncertainty
            uncertainty_factor = 1.0 + (0.02 * day)
            adjusted_std = std_pred * uncertainty_factor

            # Calculate confidence intervals
            lower = mean_pred - z_score * adjusted_std
            upper = mean_pred + z_score * adjusted_std

            # Store results (still in normalized scale)
            predictions.append(mean_pred)
            uncertainties.append(adjusted_std)
            lower_bounds.append(lower)
            upper_bounds.append(upper)

            # Update sequence for next prediction:
            # Remove oldest value, append new prediction
            current_sequence = np.roll(current_sequence, -1, axis=0)
            current_sequence[-1] = mean_pred

        # Convert from normalized scale back to real prices
        predictions = self.scaler.inverse_transform(
            np.array(predictions).reshape(-1, 1)
        ).flatten()

        lower_bounds = self.scaler.inverse_transform(
            np.array(lower_bounds).reshape(-1, 1)
        ).flatten()

        upper_bounds = self.scaler.inverse_transform(
            np.array(upper_bounds).reshape(-1, 1)
        ).flatten()

        return {
            'predicted_prices': predictions.round(2).tolist(),
            'lower_bound': lower_bounds.round(2).tolist(),
            'upper_bound': upper_bounds.round(2).tolist(),
            'uncertainty': [round(u, 4) for u in uncertainties]
        }


def generate_trading_dates(start_date, horizon):
    """
    Generate future trading dates (excludes weekends).

    This function creates a list of future trading days by:
    1. Starting from the day after start_date
    2. Skipping Saturdays and Sundays
    3. Continuing until 'horizon' trading days are generated

    Note: Does not account for market holidays. For production use,
    consider integrating pandas_market_calendars for NYSE holidays.

    Args:
        start_date (datetime): Last date with historical data
        horizon (int): Number of trading days to generate

    Returns:
        list: List of date strings in 'YYYY-MM-DD' format

    Example:
        >>> from datetime import datetime
        >>> last_date = datetime(2024, 1, 5)  # Friday
        >>> dates = generate_trading_dates(last_date, 5)
        >>> dates
        ['2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11', '2024-01-12']
        # Skips Saturday 1/6 and Sunday 1/7
    """
    dates = []
    current = start_date

    while len(dates) < horizon:
        current += timedelta(days=1)

        # Monday=0, Tuesday=1, ..., Friday=4, Saturday=5, Sunday=6
        # Only include Monday through Friday
        if current.weekday() < 5:
            dates.append(current.strftime('%Y-%m-%d'))

    return dates


def generate_trading_dates_with_holidays(start_date, horizon, market='NYSE'):
    """
    Generate trading dates accounting for market holidays (optional enhancement).

    This requires the pandas_market_calendars package.
    If not installed, falls back to simple weekday filtering.

    Args:
        start_date (datetime): Last date with historical data
        horizon (int): Number of trading days
        market (str): Market calendar to use (default: 'NYSE')

    Returns:
        list: List of date strings in 'YYYY-MM-DD' format

    Note:
        To enable holiday awareness:
        pip install pandas-market-calendars
    """
    try:
        import pandas_market_calendars as mcal

        # Get market calendar
        calendar = mcal.get_calendar(market)

        # Generate schedule for next ~2x horizon days (buffer for holidays)
        end_date = start_date + timedelta(days=horizon * 2)

        schedule = calendar.schedule(
            start_date=start_date + timedelta(days=1),
            end_date=end_date
        )

        # Take first 'horizon' trading days
        trading_dates = schedule.index[:horizon].strftime('%Y-%m-%d').tolist()

        return trading_dates

    except ImportError:
        # Fallback to simple weekday filtering if package not installed
        return generate_trading_dates(start_date, horizon)
