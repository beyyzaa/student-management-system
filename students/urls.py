from django.urls import path
from .views import StudentListCreateAPIView, StudentRetrieveUpdateDestroyAPIView, DepartmentListCreateView, StudentClassListCreateView


urlpatterns = [
    path('students/', StudentListCreateAPIView.as_view(), name='student-list-create'),
    path('students/<int:pk>/', StudentRetrieveUpdateDestroyAPIView.as_view(), name='student-detail'),
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('classes/', StudentClassListCreateView.as_view(), name='class-list-create'),

]
