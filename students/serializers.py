from rest_framework import serializers
from .models import Student, Department, StudentClass

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class StudentClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentClass
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__' # Tüm alanları dahil etmek en kolayıdır
        # fields = ['id', 'first_name', 'last_name', 'email', 'enrollment_number', 'date_of_birth', 'gender', 'phone_number', 'image', 'created_at', 'updated_at']