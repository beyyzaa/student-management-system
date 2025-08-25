import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState({});
    const [classes, setClasses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 5;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [stats, setStats] = useState({
        totalStudents: 0,
        averageAge: 0,
        genderDistribution: { male: 0, female: 0 },
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                // URL'den departmentId parametresini oku
                const departmentId = searchParams.get('departmentId');
                
                // Öğrencileri çekmek için API çağrısı, departmentId varsa filtrele
                let studentsUrl = `${API_BASE_URL}/api/students/`;
                const params = new URLSearchParams();
                if (departmentId) {
                    params.append('department', departmentId);
                }
                if (params.toString()) {
                    studentsUrl += `?${params.toString()}`;
                }

                const studentsResponse = await axios.get(studentsUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStudents(studentsResponse.data);

                const departmentsResponse = await axios.get(`${API_BASE_URL}/api/departments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const departmentsMap = departmentsResponse.data.reduce((acc, department) => {
                    acc[department.id] = department.name;
                    return acc;
                }, {});
                setDepartments(departmentsMap);

                const classesResponse = await axios.get(`${API_BASE_URL}/api/classes/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const classesMap = classesResponse.data.reduce((acc, classItem) => {
                    acc[classItem.id] = classItem.name;
                    return acc;
                }, {});
                setClasses(classesMap);

                calculateStats(studentsResponse.data);
                setLoading(false);

            } catch (err) {
                console.error('Veri çekilemedi:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/');
                } else {
                    setError('Veriler yüklenirken bir hata oluştu.');
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, searchParams]);

    const calculateStats = (studentList) => {
        const total = studentList.length;
        const maleCount = studentList.filter(s => s.gender === 'male').length;
        const femaleCount = studentList.filter(s => s.gender === 'female').length;

        const totalAge = studentList.reduce((sum, s) => {
            const birthYear = new Date(s.date_of_birth).getFullYear();
            const currentYear = new Date().getFullYear();
            return sum + (currentYear - birthYear);
        }, 0);

        const averageAge = total > 0 ? (totalAge / total).toFixed(2) : 0;

        setStats({
            totalStudents: total,
            averageAge: averageAge,
            genderDistribution: {
                male: total > 0 ? ((maleCount / total) * 100).toFixed(2) : 0,
                female: total > 0 ? ((femaleCount / total) * 100).toFixed(2) : 0,
            },
        });
    };

    const handleDeleteStudent = async (id) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        console.log(`Deleting student with ID: ${id}`);
        try {
            await axios.delete(`${API_BASE_URL}/api/students/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const updatedStudents = students.filter(student => student.id !== id);
            setStudents(updatedStudents);
            calculateStats(updatedStudents);
            console.log('Öğrenci başarıyla silindi.');
        } catch (err) {
            console.error('Öğrenci silinirken bir hata oluştu:', err);
            console.error('Silme işleminde hata oluştu.');
        }
    };
    
    const handleSearch = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        const departmentId = searchParams.get('departmentId');
        let url = `${API_BASE_URL}/api/students/`;
        const params = new URLSearchParams();

        if (searchTerm) {
            params.append('search', searchTerm);
        }
        if (genderFilter) {
            params.append('gender', genderFilter);
        }
        if (departmentId) {
            params.append('department', departmentId);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data);
            calculateStats(response.data);
            setCurrentPage(1);
            setLoading(false);
        } catch (err) {
            console.error('Arama veya filtreleme hatası:', err);
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const searchMatch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
        const genderMatch = genderFilter === '' || student.gender === genderFilter;
        return searchMatch && genderMatch;
    });

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div className="loading-container">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="main-layout">
            <div className="sidebar">
                <div className="student-system-title">Student System</div>
                <nav className="nav-menu">
                    <a href="/dashboard" className="nav-item">
                        <i className="fa-solid fa-house"></i> Home
                    </a>
                    <a href="/students" className="nav-item active">
                        <i className="fa-solid fa-users"></i> Students
                    </a>
                    <a href="/departments" className="nav-item">
                        <i className="fa-solid fa-building"></i> Departments
                    </a>
                </nav>
                <button className="logout-button" onClick={() => {
                    localStorage.removeItem('access_token');
                    navigate('/');
                }}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
            <div className="content">
                <div className="students-page-container">
                    <h1 className="page-title">Students</h1>
                    
                    <div className="stats-container">
                        <div className="stat-card">
                            <span className="icon">
                                <i className="fa-solid fa-users"></i>
                            </span>
                            <h3>Total Students</h3>
                            <p>{stats.totalStudents}</p>
                        </div>
                        <div className="stat-card">
                            <span className="icon">
                                <i className="fa-solid fa-cake-candles"></i>
                            </span>
                            <h3>Average Age</h3>
                            <p>{stats.averageAge}</p>
                        </div>
                        <div className="stat-card">
                            <span className="icon">
                                <i className="fa-solid fa-venus-mars"></i>
                            </span>
                            <h3>Gender Distribution</h3>
                            <div className="gender-distribution-flex">
                                <span><i className="fa-solid fa-mars"></i> {stats.genderDistribution.male}%</span>
                                <span><i className="fa-solid fa-venus"></i> {stats.genderDistribution.female}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <input
                            type="text"
                            placeholder="Search by student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                            <option value="">Search by gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <button onClick={handleSearch}>Search</button>
                    </div>
                    <button onClick={() => navigate('/add-student')} className="add-student-button">
                        Add New Student
                    </button>
                    <div className="students-table-wrapper">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Enrollment Number</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Birthdate</th>
                                    <th>Gender</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Class</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.enrollment_number}</td>
                                        <td>
                                            {student.image ? (
                                                <img
                                                    src={student.image}
                                                    alt={`${student.first_name}`}
                                                    className="student-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=No+Img';
                                                        e.target.className = 'no-image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="no-image">No Img</div>
                                            )}
                                        </td>
                                        <td>{student.first_name} {student.last_name}</td>
                                        <td>{student.date_of_birth}</td>
                                        <td>{student.gender}</td>
                                        <td>{student.phone_number}</td>
                                        <td>{student.email}</td>
                                        <td>{departments[student.department]}</td>
                                        <td>{classes[student.student_class]}</td>
                                        <td>
                                            <button
                                                onClick={() => navigate(`/edit-student/${student.id}`)}
                                                className="action-button edit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="action-button delete"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-container">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentsPage;