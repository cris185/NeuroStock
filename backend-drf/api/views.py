"""
Stock Prediction API Views

Dual-mode prediction system:
1. Backtesting: Evaluates model on historical test data (ALWAYS executed)
2. Future Prediction: Recursive forecasting with confidence intervals (OPTIONAL)

Critical Fix: Data leakage in scaler has been corrected.
Scaler is now fitted ONLY on training data, never on test data.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import StockPredictionSerializers
from .data_pipeline import (
    download_stock_data,
    prepare_backtesting_data,
    create_sequences
)
from .prediction_engine import FuturePredictionEngine, generate_trading_dates
from .ml_manager import MLModelManager
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np


class StockPredictionAPIView(APIView):
    """
    Stock prediction endpoint supporting both backtesting and future predictions.

    POST /api/v1/predict/
    Body: {
        "ticker": "AAPL",
        "future_days": 30,  # Optional, default 0 (backtesting only)
        "confidence_level": 0.95  # Optional, default 0.95
    }
    """

    def post(self, request):
        # Validate request data
        serializer = StockPredictionSerializers(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid input.', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticker = serializer.validated_data['ticker']
        future_days = serializer.validated_data.get('future_days', 0)
        confidence_level = serializer.validated_data.get('confidence_level', 0.95)

        try:
            # 1. Download and prepare data
            df = download_stock_data(ticker, years=10)
            close_prices = df['Close'].squeeze()

            # 2. Calculate moving averages (for visualization)
            ma100 = close_prices.rolling(100).mean()
            ma200 = close_prices.rolling(200).mean()

            # 3. Perform backtesting (ALWAYS executed)
            backtesting_result = self._perform_backtesting(close_prices, df.index)

            # 4. Build base response
            response_data = {
                'status': 'success',
                'ticker': ticker,
                'historical_data': {
                    'dates': df.index.strftime('%Y-%m-%d').tolist(),
                    'close_prices': close_prices.round(2).tolist()
                },
                'ma_data': {
                    'ma100': ma100.fillna(0).round(2).tolist(),
                    'ma200': ma200.fillna(0).round(2).tolist()
                },
                'backtesting': backtesting_result
            }

            # 5. Perform future prediction (OPTIONAL - if future_days > 0)
            if future_days > 0:
                future_result = self._perform_future_prediction(
                    historical_prices=close_prices.values,
                    horizon=future_days,
                    confidence_level=confidence_level,
                    last_date=df.index[-1]
                )
                response_data['future_predictions'] = future_result

            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError as e:
            # Expected errors (ticker not found, insufficient data, etc.)
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Unexpected errors
            return Response(
                {'error': f'Prediction failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _perform_backtesting(self, close_prices, dates):
        """
        Perform backtesting on historical data WITHOUT data leakage.

        Critical Fix: Scaler is fitted ONLY on training data (70%),
        never on test data (30%). This prevents information leakage.

        Args:
            close_prices (pd.Series): Closing prices time series
            dates (pd.DatetimeIndex): Corresponding dates

        Returns:
            dict: Backtesting results with predictions and metrics
        """
        # Split data (70% train, 30% test)
        data_split = prepare_backtesting_data(close_prices, train_ratio=0.7)

        # ✅ CORRECT: Fit scaler ONLY on training data
        train_scaler = MinMaxScaler(feature_range=(0, 1))
        train_scaler.fit(data_split['train'].values.reshape(-1, 1))

        # Transform past_100 and test data using TRAINING scaler
        past_100_scaled = train_scaler.transform(
            data_split['past_100'].values.reshape(-1, 1)
        )
        test_scaled = train_scaler.transform(
            data_split['test'].values.reshape(-1, 1)
        )

        # Combine for sequence creation
        input_data = np.concatenate([past_100_scaled, test_scaled], axis=0)

        # Create sequences
        x_test, y_test = create_sequences(input_data, sequence_length=100)

        # Get model from manager (cached, efficient)
        model = MLModelManager.get_instance().get_model()

        # Predict
        y_predicted_scaled = model.predict(x_test, verbose=0)

        # Inverse transform to real prices
        y_predicted = train_scaler.inverse_transform(
            y_predicted_scaled.reshape(-1, 1)
        ).flatten()

        y_actual = train_scaler.inverse_transform(
            y_test.reshape(-1, 1)
        ).flatten()

        # Calculate metrics
        mse = mean_squared_error(y_actual, y_predicted)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_actual, y_predicted)

        # Calculate test dates
        split_idx = data_split['split_idx']
        test_start_idx = split_idx + 100  # Account for past_100 days
        test_dates = dates[test_start_idx:].strftime('%Y-%m-%d').tolist()

        return {
            'test_dates': test_dates,
            'test_prices': y_actual.round(2).tolist(),
            'predicted_prices': y_predicted.round(2).tolist(),
            'metrics': {
                'mse': round(float(mse), 2),
                'rmse': round(float(rmse), 2),
                'r2': round(float(r2), 4)
            }
        }

    def _perform_future_prediction(self, historical_prices, horizon,
                                   confidence_level, last_date):
        """
        Perform recursive future prediction with confidence intervals.

        Uses Monte Carlo Dropout to estimate prediction uncertainty.

        Args:
            historical_prices (np.ndarray): All historical prices
            horizon (int): Number of days to predict (1-365)
            confidence_level (float): Confidence level for intervals (0.80-0.99)
            last_date (pd.Timestamp): Last historical date

        Returns:
            dict: Future predictions with confidence intervals
        """
        # Get model and scaler from manager
        model = MLModelManager.get_instance().get_model()
        scaler = MLModelManager.get_instance().get_training_scaler()

        # Initialize prediction engine
        engine = FuturePredictionEngine(model, scaler)

        # Perform prediction
        result = engine.predict_future(
            historical_prices=historical_prices,
            horizon=horizon,
            confidence_level=confidence_level,
            mc_iterations=50
        )

        # Generate trading dates
        result['dates'] = generate_trading_dates(last_date, horizon)
        result['confidence_level'] = confidence_level

        # Add warning for long horizons
        if horizon > 60:
            result['warning'] = (
                f'Predicciones más allá de 60 días tienen alta incertidumbre. '
                f'Use con precaución.'
            )

        return result
