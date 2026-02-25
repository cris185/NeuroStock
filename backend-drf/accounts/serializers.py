from django.contrib.auth.models import User
from rest_framework import serializers
import re


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8, 
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def validate_password(self, value):
        """
        Validación de contraseña con requisitos de seguridad:
        - Mínimo 8 caracteres
        - Al menos una letra mayúscula
        - Al menos una letra minúscula
        - Al menos un número
        """
        errors = []
        
        if len(value) < 8:
            errors.append('La contraseña debe tener al menos 8 caracteres.')
        
        if not re.search(r'[A-Z]', value):
            errors.append('La contraseña debe tener al menos una letra mayúscula.')
        
        if not re.search(r'[a-z]', value):
            errors.append('La contraseña debe tener al menos una letra minúscula.')
        
        if not re.search(r'[0-9]', value):
            errors.append('La contraseña debe tener al menos un número.')
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value
    
    def create(self, validated_data):
        # User.objects.create = guarda el password en texto plano
        # User.objects.create_user = guarda el password encriptado
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para ver y actualizar el perfil del usuario.
    """
    date_joined = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']
    
    def validate_email(self, value):
        """
        Validar que el email no esté en uso por otro usuario.
        """
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Este email ya está en uso.')
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar el reset de contraseña.
    """
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """
        Verifica que el email existe en el sistema.
        """
        if not User.objects.filter(email=value).exists():
            # Por seguridad, no revelamos si el email existe o no
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar el reset de contraseña con nueva contraseña.
    """
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate_password(self, value):
        """
        Validación de contraseña con requisitos de seguridad.
        """
        errors = []
        
        if len(value) < 8:
            errors.append('La contraseña debe tener al menos 8 caracteres.')
        
        if not re.search(r'[A-Z]', value):
            errors.append('La contraseña debe tener al menos una letra mayúscula.')
        
        if not re.search(r'[a-z]', value):
            errors.append('La contraseña debe tener al menos una letra minúscula.')
        
        if not re.search(r'[0-9]', value):
            errors.append('La contraseña debe tener al menos un número.')
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value
    
    def validate(self, attrs):
        """
        Verifica que las contraseñas coincidan.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
        return attrs


class PasswordResetVerifyTokenSerializer(serializers.Serializer):
    """
    Serializer para verificar si un token es válido.
    """
    token = serializers.CharField()