from django.urls import path
from accounts import views as UserViews
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import StockPredictionAPIView


urlpatterns = [
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
    
    # Prediction API
    path('predict/', StockPredictionAPIView.as_view(), name='stock-prediction'),
]