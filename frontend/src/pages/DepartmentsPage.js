import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css'; // Updated CSS file

const API_BASE_URL = 'http://127.0.0.1:8000';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const departmentsResponse = await axios.get(`${API_BASE_URL}/api/departments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const studentsResponse = await axios.get(`${API_BASE_URL}/api/students/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setDepartments(departmentsResponse.data);
                setStudents(studentsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Veriler çekilemedi:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/');
                } else {
                    setError('Veriler yüklenirken bir hata oluştu.');
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleViewStudents = (departmentId) => {
        navigate(`/departments/${departmentId}/students`);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/');
    };

    if (loading) {
        return <div className="loading-container">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="main-layout-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Student System</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <Link to="/dashboard" className="nav-link">
                                <i className="fa-solid fa-home"></i> Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/students" className="nav-link">
                                <i className="fa-solid fa-users"></i> Students
                            </Link>
                        </li>
                        <li>
                            <Link to="/departments" className="nav-link">
                                <i className="fa-solid fa-building"></i> Departments
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button 
                    onClick={handleLogout}
                    className="logout-button"
                >
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
            <div className="content-container">
                <div className="departments-page-container">
                    <div className="departments-grid-wrapper">
                        <div className="departments-grid">
                            {departments.map((department) => {
                                // Her departman için öğrenci sayısını client-side'da hesapla
                                const studentCount = students.filter(student => student.department === department.id).length;
                                return (
                                    <div key={department.id} className="department-card">
                                        <div className="department-info">
                                            <h3>{department.name}</h3>
                                            {/* Her departmanın kendi öğrenci sayısı gösteriliyor. */}
                                            <p>Total Students: {studentCount}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleViewStudents(department.id)}
                                            className="view-button"
                                        >
                                            <i className="fa-solid fa-eye"></i> View Students
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;