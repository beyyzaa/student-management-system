import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBuilding, FaCalendarAlt, FaVenusMars, FaSignOutAlt, FaHome, FaUserGraduate, FaUniversity } from 'react-icons/fa';
import './DashboardPage.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDepartments: 0,
    averageAge: 0,
    genderDistribution: { male: 0, female: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const studentsRes = await axios.get(`${API_BASE_URL}/api/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const departmentsRes = await axios.get(`${API_BASE_URL}/api/departments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const students = studentsRes.data;
        const totalStudents = students.length;
        const totalDepartments = departmentsRes.data.length;

        const maleCount = students.filter((s) => s.gender === 'male').length;
        const femaleCount = students.filter((s) => s.gender === 'female').length;
        const malePercentage = totalStudents ? (maleCount / totalStudents) * 100 : 0;
        const femalePercentage = totalStudents ? (femaleCount / totalStudents) * 100 : 0;

        const totalAge = students.reduce((sum, s) => {
          if (s.date_of_birth) {
            const birth = new Date(s.date_of_birth);
            const age = new Date().getFullYear() - birth.getFullYear();
            return sum + age;
          }
          return sum;
        }, 0);
        const averageAge = totalStudents ? (totalAge / totalStudents).toFixed(1) : 0;

        setStats({
          totalStudents,
          totalDepartments,
          averageAge,
          genderDistribution: { male: malePercentage, female: femalePercentage },
        });
        setIsLoading(false);
      } catch (err) {
        if (err.response?.status === 401) navigate('/');
        else setError('Failed to load dashboard data.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <h2>Student System</h2>
        <nav>
          <ul>
            <li onClick={() => navigate('/dashboard')}><FaHome /> Home</li>
            <li onClick={() => navigate('/students')}><FaUserGraduate /> Students</li>
            <li onClick={() => navigate('/departments')}><FaUniversity /> Departments</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="dashboard-content">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <FaUsers className="icon" />
            <h3>Total Students</h3>
            <p>{stats.totalStudents}</p>
          </div>
          <div className="stat-card">
            <FaBuilding className="icon" />
            <h3>Total Departments</h3>
            <p>{stats.totalDepartments}</p>
          </div>
          <div className="stat-card">
            <FaCalendarAlt className="icon" />
            <h3>Average Age</h3>
            <p>{stats.averageAge}</p>
          </div>
          <div className="stat-card">
            <FaVenusMars className="icon" />
            <h3>Gender Distribution</h3>
            <p>
              <span className="male">♂ {stats.genderDistribution.male.toFixed(1)}%</span> |
              <span className="female"> ♀ {stats.genderDistribution.female.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
