from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets


class PasswordResetToken(models.Model):
    """
    Model to store password reset tokens.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset token for {self.user.username}"
    
    @classmethod
    def create_token(cls, user):
        """
        Create a new password reset token for the user.
        Invalidate any existing tokens.
        """
        # Invalidate existing tokens
        cls.objects.filter(user=user, used=False).update(used=True)
        
        # Generate a secure token
        token = secrets.token_urlsafe(32)
        
        return cls.objects.create(user=user, token=token)
    
    def is_valid(self):
        """
        Check if the token is valid (not used and not expired).
        Token expires after 1 hour.
        """
        if self.used:
            return False
        
        expiration_time = self.created_at + timezone.timedelta(hours=1)
        return timezone.now() < expiration_time
