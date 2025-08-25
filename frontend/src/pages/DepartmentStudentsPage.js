import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const classMapping = {
    1: 'Hazırlık',
    2: '1.Sınıf',
    3: '2.Sınıf',
    4: '3.Sınıf',
    5: '4.Sınıf',
    6: 'Mezun',
    7: 'Doktora',
};

const DepartmentStudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [departmentName, setDepartmentName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { departmentId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchDepartmentStudents = async () => {
            try {
                // Departman adını çekmek için API isteği
                const departmentResponse = await axios.get(`${API_BASE_URL}/api/departments/?id=${departmentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (departmentResponse.data.length > 0) {
                    setDepartmentName(departmentResponse.data[0].name);
                } else {
                    setDepartmentName('Bilinmeyen Departman');
                }
                
                // Tüm öğrencileri çekmek için API isteği.
                // Not: API'niz 'department' parametresine göre filtreleme yapmadığı için
                // tüm öğrencileri çekip frontend'de filtreleme yapıyoruz.
                const studentsResponse = await axios.get(`${API_BASE_URL}/api/students/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // Gelen öğrenci listesini departmentId'ye göre filtreliyoruz.
                const filteredStudents = studentsResponse.data.filter(
                    student => String(student.department) === departmentId
                );

                setStudents(filteredStudents);
                setLoading(false);
            } catch (err) {
                console.error('Öğrenciler çekilemedi:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/');
                } else {
                    setError('Öğrenciler yüklenirken bir hata oluştu.');
                }
                setLoading(false);
            }
        };

        fetchDepartmentStudents();
    }, [departmentId, navigate]);

    if (loading) {
        return <div className="loading-container">Yükleniyor...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="students-page-container">
            <div className="students-table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Enrollment Number</th>
                            <th>Name</th>
                            <th>Date of Birth</th>
                            <th>Gender</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.enrollment_number}</td>
                                <td>{student.first_name} {student.last_name}</td>
                                <td>{student.date_of_birth}</td>
                                <td>{student.gender}</td>
                                <td>{student.phone_number}</td>
                                <td>{student.email}</td>
                                <td>{classMapping[student.student_class] || student.student_class}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DepartmentStudentsPage;
