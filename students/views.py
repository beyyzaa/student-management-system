from django.shortcuts import render
from rest_framework import generics, permissions,filters
from .models import Student, Department, StudentClass
from .serializers import StudentSerializer, DepartmentSerializer, StudentClassSerializer
from django_filters.rest_framework import DjangoFilterBackend

class StudentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    # FilterBackend ve SearchFilter birlikte kullanılabilir
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['gender'] # Sadece cinsiyet filtresi için
    search_fields = ['first_name', 'last_name', 'email'] # İsim ve mail adresinde arama için

# API view for departments (New)
class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

# API view for student classes (New)
class StudentClassListCreateView(generics.ListCreateAPIView):
    queryset = StudentClass.objects.all()
    serializer_class = StudentClassSerializer
    
class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
