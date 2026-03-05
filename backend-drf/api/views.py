"""
Stock Prediction API Views

Includes:
1. StockPredictionAPIView     — Prediction endpoint (backtesting + future)
2. ModelConfigListCreateView  — CRUD for user model configurations
3. ModelConfigDetailView      — Detail/update/delete a model config
4. ModelConfigActivateView    — Activate a model config
5. ProviderListView           — List available providers + user configs
6. ProviderTestView           — Validate a provider API key
7. MarketQuoteView            — Real-time/delayed quote for a ticker
8. MarketIntradayView         — Intraday chart data (Finnhub only)
9. PredictionHistoryListView  — Paginated prediction history with filters
10. PredictionHistoryDetailView — Delete a single prediction record
11. PredictionStatsView       — Aggregated stats for dashboard
12. PredictionExportView      — Export history as CSV
"""

import csv
from io import StringIO
from datetime import timedelta

from django.core.cache import cache
from django.db.models import Count, Max
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

from .data_pipeline import prepare_backtesting_data, create_sequences
from .data_providers import (
    get_provider_with_fallback,
    get_realtime_provider,
    FinnhubProvider,
    AlphaVantageProvider,
    YFinanceProvider,
)
from .ml_manager import MLModelManager
from .models import ModelConfig, ProviderConfig, PredictionRecord
from .prediction_engine import FuturePredictionEngine, generate_trading_dates
from .serializers import (
    StockPredictionSerializers,
    ModelConfigSerializer,
    ProviderConfigSerializer,
    PredictionRecordSerializer,
)


# ---------------------------------------------------------------------------
# Stock Prediction
# ---------------------------------------------------------------------------

class StockPredictionAPIView(APIView):
    """
    POST /api/v1/predict/
    Body: {"ticker": "AAPL", "future_days": 30, "confidence_level": 0.95}

    Uses the user's active ModelConfig (if any) for MC iterations,
    uncertainty growth, architecture, and confidence defaults.
    Uses the user's active data provider (if configured).
    Saves a PredictionRecord after each successful prediction.
    """

    def post(self, request):
        serializer = StockPredictionSerializers(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid input.', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticker = serializer.validated_data['ticker'].upper()
        future_days = serializer.validated_data.get('future_days', 0)

        # Resolve active model config parameters
        model_config = None
        if request.user.is_authenticated:
            model_config = ModelConfig.objects.filter(
                user=request.user, is_active=True
            ).first()

        mc_iterations = model_config.mc_iterations if model_config else 50
        uncertainty_growth = model_config.uncertainty_growth if model_config else 0.02
        architecture = model_config.architecture if model_config else 'lstm'
        sequence_length = model_config.sequence_length if model_config else 100

        confidence_level = serializer.validated_data.get(
            'confidence_level',
            model_config.default_confidence if model_config else 0.95
        )

        try:
            # Check if requested architecture is available
            manager = MLModelManager.get_instance()
            if not manager.is_architecture_available(architecture):
                if architecture != 'lstm':
                    return Response(
                        {
                            'error': (
                                f"Model file for '{architecture.upper()}' architecture not found. "
                                f"Train the model locally and place the .onnx file in backend-drf/. "
                                f"Falling back to LSTM is not automatic — update your active config."
                            )
                        },
                        status=status.HTTP_422_UNPROCESSABLE_ENTITY
                    )

            # Download data via provider abstraction (with yahooquery fallback)
            df = get_provider_with_fallback(ticker, user=request.user, years=10)
            provider_name = _resolve_provider_name(request.user)

            close_prices = df['Close'].squeeze()

            # Calculate moving averages (visualization only)
            ma100 = close_prices.rolling(100).mean()
            ma200 = close_prices.rolling(200).mean()

            # Backtesting (always executed)
            backtesting_result = self._perform_backtesting(
                close_prices, df.index,
                sequence_length=sequence_length,
                architecture=architecture
            )

            response_data = {
                'status': 'success',
                'ticker': ticker,
                'provider': provider_name,
                'model_config': {
                    'id': model_config.id if model_config else None,
                    'name': model_config.name if model_config else 'Default',
                    'architecture': architecture,
                    'sequence_length': sequence_length,
                    'mc_iterations': mc_iterations,
                } if model_config else None,
                'historical_data': {
                    'dates': df.index.strftime('%Y-%m-%d').tolist(),
                    'close_prices': close_prices.round(2).tolist(),
                },
                'ma_data': {
                    'ma100': ma100.fillna(0).round(2).tolist(),
                    'ma200': ma200.fillna(0).round(2).tolist(),
                },
                'backtesting': backtesting_result,
            }

            future_result = None
            if future_days > 0:
                future_result = self._perform_future_prediction(
                    historical_prices=close_prices.values,
                    horizon=future_days,
                    confidence_level=confidence_level,
                    last_date=df.index[-1],
                    mc_iterations=mc_iterations,
                    uncertainty_growth=uncertainty_growth,
                    architecture=architecture,
                )
                response_data['future_predictions'] = future_result

            # Save prediction record asynchronously (best-effort)
            if request.user.is_authenticated:
                try:
                    _save_prediction_record(
                        user=request.user,
                        ticker=ticker,
                        provider=provider_name,
                        model_config=model_config,
                        future_days=future_days,
                        confidence_level=confidence_level,
                        backtesting=backtesting_result,
                        future=future_result,
                    )
                except Exception:
                    pass  # Never fail the prediction because of history saving

            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError as e:
            return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            return Response(
                {'error': f'Prediction failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _perform_backtesting(self, close_prices, dates, sequence_length=100, architecture='lstm'):
        data_split = prepare_backtesting_data(close_prices, train_ratio=0.7)

        train_scaler = MinMaxScaler(feature_range=(0, 1))
        train_scaler.fit(data_split['train'].values.reshape(-1, 1))

        past_100_scaled = train_scaler.transform(
            data_split['past_100'].values.reshape(-1, 1)
        )
        test_scaled = train_scaler.transform(
            data_split['test'].values.reshape(-1, 1)
        )

        input_data = np.concatenate([past_100_scaled, test_scaled], axis=0)
        x_test, y_test = create_sequences(input_data, sequence_length=sequence_length)

        model = MLModelManager.get_instance().get_model(architecture=architecture)
        input_name = model.get_inputs()[0].name
        y_predicted_scaled = model.run(None, {input_name: x_test.astype('float32')})[0]

        y_predicted = train_scaler.inverse_transform(
            y_predicted_scaled.reshape(-1, 1)
        ).flatten()
        y_actual = train_scaler.inverse_transform(
            y_test.reshape(-1, 1)
        ).flatten()

        mse = mean_squared_error(y_actual, y_predicted)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_actual, y_predicted)

        split_idx = data_split['split_idx']
        test_start_idx = split_idx + sequence_length
        test_dates = dates[test_start_idx:].strftime('%Y-%m-%d').tolist()

        return {
            'test_dates': test_dates,
            'test_prices': y_actual.round(2).tolist(),
            'predicted_prices': y_predicted.round(2).tolist(),
            'metrics': {
                'mse': round(float(mse), 2),
                'rmse': round(float(rmse), 2),
                'r2': round(float(r2), 4),
            },
        }

    def _perform_future_prediction(self, historical_prices, horizon, confidence_level,
                                   last_date, mc_iterations=50, uncertainty_growth=0.02,
                                   architecture='lstm'):
        model = MLModelManager.get_instance().get_model(architecture=architecture)
        scaler = MLModelManager.get_instance().get_training_scaler()

        engine = FuturePredictionEngine(
            model, scaler,
            uncertainty_growth=uncertainty_growth,
        )
        result = engine.predict_future(
            historical_prices=historical_prices,
            horizon=horizon,
            confidence_level=confidence_level,
            mc_iterations=mc_iterations,
        )
        result['dates'] = generate_trading_dates(last_date, horizon)
        result['confidence_level'] = confidence_level
        if horizon > 60:
            result['warning'] = (
                f'Predicciones más allá de 60 días tienen alta incertidumbre. '
                f'Use con precaución.'
            )
        return result


# ---------------------------------------------------------------------------
# Model Configuration
# ---------------------------------------------------------------------------

class ModelConfigListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ModelConfigSerializer

    def get_queryset(self):
        return ModelConfig.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        last_version = (
            ModelConfig.objects.filter(user=self.request.user)
            .aggregate(Max('version'))['version__max'] or 0
        )
        serializer.save(user=self.request.user, version=last_version + 1)


class ModelConfigDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ModelConfigSerializer
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return ModelConfig.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.is_active:
            raise ValidationError("Cannot delete the active configuration. Activate another config first.")
        instance.delete()


class ModelConfigActivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            config = ModelConfig.objects.get(pk=pk, user=request.user)
        except ModelConfig.DoesNotExist:
            return Response({'error': 'Model config not found.'}, status=status.HTTP_404_NOT_FOUND)

        ModelConfig.objects.filter(user=request.user, is_active=True).update(is_active=False)
        config.is_active = True
        config.save()
        return Response(ModelConfigSerializer(config).data)


class ModelConfigAvailabilityView(APIView):
    """Returns which model architectures have their .onnx files present."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        manager = MLModelManager.get_instance()
        return Response({
            arch: manager.is_architecture_available(arch)
            for arch in ['lstm', 'gru', 'bilstm']
        })


# ---------------------------------------------------------------------------
# Data Providers
# ---------------------------------------------------------------------------

PROVIDER_METADATA = {
    'yfinance': {
        'label': 'Yahoo Finance',
        'description': 'Default provider. No API key required. Unlimited historical data.',
        'requires_key': False,
        'supports_realtime': False,
        'supports_intraday': False,
        'free_limit': 'Unlimited (unofficial)',
        'data_delay': 'End-of-day',
        'history_years': 10,
    },
    'alphavantage': {
        'label': 'Alpha Vantage',
        'description': 'Official NASDAQ data vendor. 20+ years of history. 25 req/day on free tier.',
        'requires_key': True,
        'supports_realtime': False,
        'supports_intraday': False,
        'free_limit': '25 requests/day',
        'data_delay': '15-20 min delayed',
        'history_years': 20,
        'key_url': 'https://www.alphavantage.co/support/#api-key',
    },
    'finnhub': {
        'label': 'Finnhub',
        'description': 'Real-time quotes. 60 calls/min on free tier. Used for live quote widget.',
        'requires_key': True,
        'supports_realtime': True,
        'supports_intraday': True,
        'free_limit': '60 calls/minute',
        'data_delay': 'Real-time',
        'history_years': 1,
        'key_url': 'https://finnhub.io/dashboard',
    },
}


class ProviderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_configs = {
            c.provider: c
            for c in ProviderConfig.objects.filter(user=request.user)
        }
        result = []
        for provider_id, meta in PROVIDER_METADATA.items():
            config = user_configs.get(provider_id)
            result.append({
                **meta,
                'id': provider_id,
                'configured': config is not None,
                'is_active': config.is_active if config else (provider_id == 'yfinance'),
                'is_valid': config.is_valid if config else (True if provider_id == 'yfinance' else None),
                'last_tested_at': config.last_tested_at.isoformat() if config and config.last_tested_at else None,
            })
        return Response(result)

    def post(self, request):
        provider = request.data.get('provider')
        api_key = request.data.get('api_key', '')
        is_active = request.data.get('is_active', False)

        if provider not in PROVIDER_METADATA:
            return Response({'error': 'Invalid provider.'}, status=status.HTTP_400_BAD_REQUEST)

        config, _ = ProviderConfig.objects.update_or_create(
            user=request.user,
            provider=provider,
            defaults={'api_key': api_key, 'is_active': is_active},
        )

        # Only one non-Finnhub provider can be active at a time
        if is_active and provider != 'finnhub':
            ProviderConfig.objects.filter(
                user=request.user, is_active=True
            ).exclude(pk=config.pk).exclude(provider='finnhub').update(is_active=False)

        return Response(ProviderConfigSerializer(config).data)


class ProviderTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        provider = request.data.get('provider')
        api_key = request.data.get('api_key', '')

        if provider not in PROVIDER_METADATA:
            return Response({'error': 'Invalid provider.'}, status=status.HTTP_400_BAD_REQUEST)

        if provider == 'yfinance':
            valid = True
        elif provider == 'alphavantage':
            p = AlphaVantageProvider(api_key)
            valid = p.validate_key()
        elif provider == 'finnhub':
            p = FinnhubProvider(api_key)
            valid = p.validate_key()
        else:
            valid = False

        print(f"[ProviderTest] provider={provider} valid={valid}", flush=True)

        ProviderConfig.objects.filter(
            user=request.user, provider=provider
        ).update(is_valid=valid, last_tested_at=timezone.now())

        return Response({'valid': valid, 'provider': provider})


# ---------------------------------------------------------------------------
# Market Data
# ---------------------------------------------------------------------------

class MarketQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticker):
        ticker = ticker.upper()
        cache_key = f'quote_{ticker}_{request.user.id}'
        cached = cache.get(cache_key)
        if cached:
            return Response({**cached, 'cached': True})

        try:
            provider = get_realtime_provider(request.user)
            quote = provider.get_quote(ticker)
            cache.set(cache_key, quote, 60)  # 60s TTL
            return Response({**quote, 'cached': False})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class MarketIntradayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticker):
        ticker = ticker.upper()
        provider = get_realtime_provider(request.user)

        if not isinstance(provider, FinnhubProvider):
            return Response(
                {
                    'error': 'Intraday data requires a Finnhub API key.',
                    'requires_finnhub': True,
                    'setup_url': PROVIDER_METADATA['finnhub']['key_url'],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            interval = request.query_params.get('interval', '5')
            df = provider.get_intraday(ticker, interval)
            return Response({
                'ticker': ticker,
                'interval': interval,
                'dates': df.index.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                'close': df['Close'].round(2).tolist(),
                'open': df['Open'].round(2).tolist(),
                'high': df['High'].round(2).tolist(),
                'low': df['Low'].round(2).tolist(),
                'volume': df['Volume'].tolist(),
                'provider': 'finnhub',
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# Prediction History
# ---------------------------------------------------------------------------

class PredictionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


class PredictionHistoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PredictionRecordSerializer
    pagination_class = PredictionPagination

    def get_queryset(self):
        qs = PredictionRecord.objects.filter(user=self.request.user)
        ticker = self.request.query_params.get('ticker')
        provider = self.request.query_params.get('provider')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if ticker:
            qs = qs.filter(ticker__iexact=ticker)
        if provider:
            qs = qs.filter(provider=provider)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs


class PredictionHistoryDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PredictionRecordSerializer

    def get_queryset(self):
        return PredictionRecord.objects.filter(user=self.request.user)


class PredictionStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = PredictionRecord.objects.filter(user=request.user)

        total_predictions = records.count()
        unique_tickers = records.values('ticker').distinct().count()

        top_stocks = list(
            records.values('ticker')
            .annotate(count=Count('ticker'))
            .order_by('-count')[:5]
        )

        recent_20 = list(records.order_by('-created_at')[:20])
        r2_trend = [
            {
                'date': r.created_at.strftime('%Y-%m-%d'),
                'r2': r.metrics.get('r2', 0) if r.metrics else 0,
                'ticker': r.ticker,
            }
            for r in reversed(recent_20)
        ]

        active_config = ModelConfig.objects.filter(
            user=request.user, is_active=True
        ).first()

        model_configs_count = ModelConfig.objects.filter(user=request.user).count()

        configured_providers = list(
            ProviderConfig.objects.filter(
                user=request.user, is_valid=True
            ).values_list('provider', flat=True)
        )
        providers_active = len(set(configured_providers) | {'yfinance'})

        recent_predictions = PredictionRecordSerializer(
            records[:5], many=True
        ).data

        return Response({
            'total_predictions': total_predictions,
            'unique_tickers': unique_tickers,
            'model_configs': model_configs_count,
            'providers_active': providers_active,
            'top_stocks': top_stocks,
            'r2_trend': r2_trend,
            'active_config': ModelConfigSerializer(active_config).data if active_config else None,
            'recent_predictions': recent_predictions,
        })


class PredictionExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = PredictionRecord.objects.filter(user=request.user)
        ticker = request.query_params.get('ticker')
        provider = request.query_params.get('provider')
        if ticker:
            records = records.filter(ticker__iexact=ticker)
        if provider:
            records = records.filter(provider=provider)

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Date', 'Ticker', 'Provider', 'Model', 'Architecture',
            'Future Days', 'Confidence', 'MSE', 'RMSE', 'R²',
            'Trend', 'Start Price', 'End Price',
        ])
        for r in records:
            arch = r.model_config.architecture if r.model_config else 'lstm'
            writer.writerow([
                r.created_at.strftime('%Y-%m-%d %H:%M'),
                r.ticker,
                r.provider,
                r.model_config.name if r.model_config else 'Default',
                arch.upper(),
                r.future_days,
                r.confidence_level,
                r.metrics.get('mse', '') if r.metrics else '',
                r.metrics.get('rmse', '') if r.metrics else '',
                r.metrics.get('r2', '') if r.metrics else '',
                r.prediction_summary.get('trend', '') if r.prediction_summary else '',
                r.prediction_summary.get('start_price', '') if r.prediction_summary else '',
                r.prediction_summary.get('end_price', '') if r.prediction_summary else '',
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="neurostock_predictions.csv"'
        return response


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_provider_name(user) -> str:
    """Return the name of the provider that will be used for the current user."""
    if user and user.is_authenticated:
        try:
            config = ProviderConfig.objects.filter(
                user=user, is_active=True, is_valid=True
            ).exclude(provider='finnhub').first()
            if config:
                return config.provider
        except Exception:
            pass
    return 'yfinance'


def _save_prediction_record(user, ticker, provider, model_config,
                             future_days, confidence_level, backtesting, future=None):
    """Persist a PredictionRecord and enforce the 100-record / 90-day limits."""
    # Cleanup: remove records older than 90 days
    cutoff = timezone.now() - timedelta(days=90)
    PredictionRecord.objects.filter(user=user, created_at__lt=cutoff).delete()

    # Cap at 100 records per user (keep most recent 99 + new one)
    existing = PredictionRecord.objects.filter(user=user).order_by('-created_at')
    if existing.count() >= 100:
        oldest_ids = list(existing.values_list('id', flat=True)[99:])
        PredictionRecord.objects.filter(id__in=oldest_ids).delete()

    # Build summary from future predictions
    summary = {}
    if future and future.get('predicted_prices'):
        prices = future['predicted_prices']
        uncertainties = future.get('uncertainty', [0])
        avg_uncertainty = round(sum(uncertainties) / len(uncertainties), 4) if uncertainties else 0
        summary = {
            'trend': 'up' if prices[-1] > prices[0] else 'down',
            'start_price': prices[0],
            'end_price': prices[-1],
            'avg_uncertainty': avg_uncertainty,
        }

    metrics = backtesting.get('metrics', {}) if backtesting else {}

    PredictionRecord.objects.create(
        user=user,
        ticker=ticker,
        provider=provider,
        model_config=model_config,
        future_days=future_days,
        confidence_level=confidence_level,
        metrics=metrics,
        prediction_summary=summary,
    )
