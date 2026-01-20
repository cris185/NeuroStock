from rest_framework import serializers


class StockPredictionSerializers(serializers.Serializer):
    """
    Serializer for stock prediction requests.

    Supports both backtesting and future prediction modes:
    - future_days=0: Backtesting only (default)
    - future_days>0: Backtesting + future predictions
    """

    ticker = serializers.CharField(
        max_length=20,
        help_text="Stock ticker symbol (e.g., AAPL, MSFT, TSLA)"
    )

    future_days = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=365,
        default=0,
        help_text="Number of days to predict into the future (0 = backtesting only)"
    )

    confidence_level = serializers.FloatField(
        required=False,
        min_value=0.80,
        max_value=0.99,
        default=0.95,
        help_text="Confidence level for prediction intervals (0.95 = 95% CI)"
    )
