from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length= 8, style={'input_type': 'password'}) #Esto hace que el password no sea traido por un GET
    class Meta:
        model = User
        fields = ['username','email','password']
    
    def create(self, validated_data):
        #User.objects.create = guarda el password en un texto plano
        #User.objects.create_user = guarda el password encriptado
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
                       
        )
        #user = User.objects.create(**validated_data) #Esto guarda todos los campos sin tener que escribir uno a uno cada campo
        return user