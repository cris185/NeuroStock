from rest_framework import serializers
from .models import ModelConfig, ProviderConfig, PredictionRecord


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


class ModelConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelConfig
        fields = [
            'id', 'name', 'version', 'architecture', 'sequence_length',
            'mc_iterations', 'uncertainty_growth', 'default_confidence',
            'technical_indicators', 'is_active', 'metrics', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'version', 'is_active', 'metrics', 'created_at']

    def validate_architecture(self, value):
        allowed = ['lstm', 'gru', 'bilstm']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Architecture must be one of: {', '.join(allowed)}"
            )
        return value

    def validate_sequence_length(self, value):
        allowed = [50, 100, 150]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Sequence length must be one of: {', '.join(str(v) for v in allowed)}"
            )
        return value

    def validate_mc_iterations(self, value):
        if not 10 <= value <= 100:
            raise serializers.ValidationError(
                "MC iterations must be between 10 and 100."
            )
        return value

    def validate_uncertainty_growth(self, value):
        if not 0.005 <= value <= 0.05:
            raise serializers.ValidationError(
                "Uncertainty growth rate must be between 0.005 (0.5%) and 0.05 (5%)."
            )
        return value

    def validate_default_confidence(self, value):
        allowed = [0.80, 0.90, 0.95, 0.99]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Default confidence must be one of: {', '.join(str(v) for v in allowed)}"
            )
        return value


class ProviderConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderConfig
        fields = ['id', 'provider', 'api_key', 'is_active', 'last_tested_at', 'is_valid']
        read_only_fields = ['id', 'last_tested_at', 'is_valid']
        extra_kwargs = {
            'api_key': {'write_only': True, 'required': False, 'allow_blank': True}
        }


class PredictionRecordSerializer(serializers.ModelSerializer):
    model_config_name = serializers.CharField(
        source='model_config.name', read_only=True, default=None
    )

    class Meta:
        model = PredictionRecord
        fields = [
            'id', 'ticker', 'provider', 'model_config', 'model_config_name',
            'future_days', 'confidence_level', 'metrics', 'prediction_summary',
            'created_at',
        ]
        read_only_fields = fields
