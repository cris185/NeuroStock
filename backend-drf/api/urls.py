from django.urls import path
from accounts import views as UserViews
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    StockPredictionAPIView,
    ModelConfigListCreateView,
    ModelConfigDetailView,
    ModelConfigActivateView,
    ModelConfigAvailabilityView,
    ProviderListView,
    ProviderTestView,
    MarketQuoteView,
    MarketIntradayView,
    PredictionHistoryListView,
    PredictionHistoryDetailView,
    PredictionStatsView,
    PredictionExportView,
)


urlpatterns = [
    # Auth
    path('register/', UserViews.RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected-view/', UserViews.ProtectedView.as_view(), name='protected-view'),

    # User Profile
    path('user/profile/', UserViews.UserProfileView.as_view(), name='user-profile'),

    # Password Reset
    path('password-reset/request/', UserViews.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', UserViews.PasswordResetVerifyTokenView.as_view(), name='password-reset-verify'),
    path('password-reset/confirm/', UserViews.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Prediction
    path('predict/', StockPredictionAPIView.as_view(), name='stock-prediction'),

    # Model Configurations — static paths MUST come before <int:pk>
    path('model-configs/availability/', ModelConfigAvailabilityView.as_view(), name='model-config-availability'),
    path('model-configs/', ModelConfigListCreateView.as_view(), name='model-config-list'),
    path('model-configs/<int:pk>/', ModelConfigDetailView.as_view(), name='model-config-detail'),
    path('model-configs/<int:pk>/activate/', ModelConfigActivateView.as_view(), name='model-config-activate'),

    # Data Providers
    path('providers/', ProviderListView.as_view(), name='provider-list'),
    path('providers/test/', ProviderTestView.as_view(), name='provider-test'),

    # Market Data
    path('market/quote/<str:ticker>/', MarketQuoteView.as_view(), name='market-quote'),
    path('market/intraday/<str:ticker>/', MarketIntradayView.as_view(), name='market-intraday'),

    # Prediction History — static paths MUST come before <int:pk>
    path('predictions/stats/', PredictionStatsView.as_view(), name='prediction-stats'),
    path('predictions/export/', PredictionExportView.as_view(), name='prediction-export'),
    path('predictions/', PredictionHistoryListView.as_view(), name='prediction-history'),
    path('predictions/<int:pk>/', PredictionHistoryDetailView.as_view(), name='prediction-history-detail'),
]
