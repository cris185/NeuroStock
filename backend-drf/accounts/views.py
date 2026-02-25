from django.shortcuts import render
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer, 
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetVerifyTokenSerializer
)
from .models import PasswordResetToken
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # No se requiere autenticación para el registro
    

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # Se requiere autenticación para acceder a esta vista
    
    def get(self, request):
        response = {
            'status': 'Request was permitted'
        }
        return Response(response, status=200)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    GET: Retorna los datos del perfil
    PATCH/PUT: Actualiza los datos del perfil
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """
    Vista para solicitar el reset de contraseña.
    Envía un email con el link de recuperación.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Crear token
            reset_token = PasswordResetToken.create_token(user)
            
            # Construir URL de reset
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}"
            
            # Enviar email
            self.send_reset_email(user, reset_url)
            
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el email existe o no
            pass
        
        return Response({
            'message': 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.'
        }, status=status.HTTP_200_OK)
    
    def send_reset_email(self, user, reset_url):
        """
        Envía el email de recuperación de contraseña.
        """
        subject = 'NeuroStock - Recuperación de Contraseña'
        
        # HTML template
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0D0F12;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; padding: 15px 25px; background: linear-gradient(135deg, #1E3A5F 0%, #2E5A8F 100%); border-radius: 12px;">
                        <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold;">
                            📈 NeuroStock
                        </h1>
                    </div>
                </div>
                
                <!-- Content Card -->
                <div style="background: linear-gradient(135deg, rgba(30, 58, 95, 0.3) 0%, rgba(46, 90, 143, 0.2) 100%); border: 1px solid rgba(46, 90, 143, 0.3); border-radius: 16px; padding: 40px; margin-bottom: 30px;">
                    <h2 style="color: #FFFFFF; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                        Recuperación de Contraseña
                    </h2>
                    
                    <p style="color: #B8BFCC; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                        Hola <strong style="color: #FFFFFF;">{user.username}</strong>,
                    </p>
                    
                    <p style="color: #B8BFCC; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en NeuroStock. 
                        Si no realizaste esta solicitud, puedes ignorar este correo.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(90deg, #1E3A5F 0%, #2E5A8F 100%); color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(30, 58, 95, 0.4);">
                            🔐 Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="color: #8A92A5; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                        Este enlace expirará en <strong style="color: #F39C12;">1 hora</strong>.
                    </p>
                </div>
                
                <!-- Alternative Link -->
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #8A92A5; font-size: 14px; margin: 0 0 10px 0;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="color: #4A7AB7; font-size: 12px; word-break: break-all; margin: 0; background: rgba(46, 90, 143, 0.1); padding: 10px; border-radius: 6px;">
                        {reset_url}
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <p style="color: #6C7589; font-size: 12px; margin: 0 0 10px 0;">
                        © 2025 NeuroStock - Stock Prediction Portal
                    </p>
                    <p style="color: #6C7589; font-size: 11px; margin: 0;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        plain_message = f"""
        NeuroStock - Recuperación de Contraseña
        
        Hola {user.username},
        
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en NeuroStock.
        
        Para restablecer tu contraseña, visita el siguiente enlace:
        {reset_url}
        
        Este enlace expirará en 1 hora.
        
        Si no realizaste esta solicitud, puedes ignorar este correo.
        
        © 2025 NeuroStock - Stock Prediction Portal
        """
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")


class PasswordResetVerifyTokenView(APIView):
    """
    Vista para verificar si un token de reset es válido.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetVerifyTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid():
                return Response({
                    'valid': False,
                    'message': 'El enlace ha expirado o ya ha sido utilizado.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'valid': True,
                'message': 'Token válido.'
            }, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Enlace de recuperación inválido.'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Vista para confirmar el reset de contraseña con la nueva contraseña.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid():
                return Response({
                    'success': False,
                    'message': 'El enlace ha expirado o ya ha sido utilizado.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Actualizar contraseña
            user = reset_token.user
            user.set_password(password)
            user.save()
            
            # Marcar token como usado
            reset_token.used = True
            reset_token.save()
            
            return Response({
                'success': True,
                'message': 'Contraseña actualizada correctamente.'
            }, status=status.HTTP_200_OK)
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Enlace de recuperación inválido.'
            }, status=status.HTTP_400_BAD_REQUEST)