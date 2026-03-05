from django.db import models
from django.contrib.auth.models import User


ARCHITECTURE_CHOICES = [
    ('lstm', 'LSTM'),
    ('gru', 'GRU'),
    ('bilstm', 'Bidirectional LSTM'),
]

PROVIDER_CHOICES = [
    ('yfinance', 'Yahoo Finance (yfinance)'),
    ('alphavantage', 'Alpha Vantage'),
    ('finnhub', 'Finnhub'),
]


class ModelConfig(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='model_configs')
    name = models.CharField(max_length=100)
    version = models.PositiveIntegerField(default=1)
    architecture = models.CharField(max_length=20, choices=ARCHITECTURE_CHOICES, default='lstm')
    sequence_length = models.PositiveIntegerField(default=100)
    mc_iterations = models.PositiveIntegerField(default=50)
    uncertainty_growth = models.FloatField(default=0.02)
    default_confidence = models.FloatField(default=0.95)
    technical_indicators = models.JSONField(default=list)
    is_active = models.BooleanField(default=False)
    metrics = models.JSONField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.name} v{self.version}"


class ProviderConfig(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_configs')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    api_key = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=False)
    last_tested_at = models.DateTimeField(null=True, blank=True)
    is_valid = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = [('user', 'provider')]

    def __str__(self):
        return f"{self.user.username} - {self.provider}"


class PredictionRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prediction_records')
    ticker = models.CharField(max_length=20)
    provider = models.CharField(max_length=50, default='yfinance')
    model_config = models.ForeignKey(
        ModelConfig, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='predictions'
    )
    future_days = models.PositiveIntegerField(default=0)
    confidence_level = models.FloatField(default=0.95)
    metrics = models.JSONField(default=dict)
    prediction_summary = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'ticker']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.ticker} @ {self.created_at.strftime('%Y-%m-%d')}"
