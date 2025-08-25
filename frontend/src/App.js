import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentsPage from './pages/StudentsPage';
import AddStudentPage from './pages/AddStudentPage';
import EditStudentPage from './pages/EditStudentPage';
import DashboardPage from './pages/DashboardPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentStudentsPage from './pages/DepartmentStudentsPage'; // Yeni sayfa bileşeni
import './index.css';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/add-student" element={<AddStudentPage />} />
      <Route path="/edit-student/:id" element={<EditStudentPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/departments" element={<DepartmentsPage />} />
      {/* O departmana ait öğrencileri listeleyecek yeni rota tanımlandı */}
      <Route path="/departments/:departmentId/students" element={<DepartmentStudentsPage />} />
    </Routes>
  );
}

export default App;