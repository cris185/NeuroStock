from django.shortcuts import render
from .serializers import UserSerializer
from rest_framework import generics
from django.contrib.auth.models import User
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