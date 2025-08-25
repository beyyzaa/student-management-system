import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

// Django API'nizin temel URL'si.
const API_BASE_URL = 'http://127.0.0.1:8000';

const EditStudentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        enrollment_number: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        image: null,
        department: '', // Yeni: Departman ID'si
        student_class: '', // Yeni: Sınıf ID'si
    });
    const [departments, setDepartments] = useState([]); // Tüm departmanları tutmak için
    const [classes, setClasses] = useState([]);       // Tüm sınıfları tutmak için
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                // Öğrenci bilgilerini çekme
                const studentResponse = await axios.get(`${API_BASE_URL}/api/students/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Tüm departman ve sınıf bilgilerini çekme
                const departmentsResponse = await axios.get(`${API_BASE_URL}/api/departments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const classesResponse = await axios.get(`${API_BASE_URL}/api/classes/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // Form verilerini doldur
                setFormData({
                    ...studentResponse.data,
                    // image alanını null olarak ayarla
                    image: null
                });

                setDepartments(departmentsResponse.data);
                setClasses(classesResponse.data);
                setLoading(false);

            } catch (error) {
                console.error('Veri çekilemedi:', error);
                alert('Veriler yüklenirken hata oluştu.');
                navigate('/students');
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        const data = new FormData();
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        data.append('enrollment_number', formData.enrollment_number);
        data.append('date_of_birth', formData.date_of_birth);
        data.append('gender', formData.gender);
        data.append('phone_number', formData.phone_number);
        data.append('department', formData.department);     // Yeni: Departman ID'si
        data.append('student_class', formData.student_class);// Yeni: Sınıf ID'si

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/api/students/${id}/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Güncelleme sonrası gelen veri:', response.data);

            alert('Öğrenci bilgileri başarıyla güncellendi!');
            navigate('/students');
        } catch (error) {
            console.error('Öğrenci güncellenirken bir hata oluştu:', error.response.data);
            alert('Güncelleme işleminde hata oluştu. Lütfen tüm alanları kontrol edin.');
        }
    };

    if (loading) {
        return <div className="loading-container">Yükleniyor...</div>;
    }

    return (
        <div className="add-student-container">
            <h1 className="page-title">Edit Student</h1>
            <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Enrollment Number</label>
                    <input type="text" name="enrollment_number" value={formData.enrollment_number} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
                </div>
                {/* Yeni Eklenecek Alanlar */}
                <div className="form-group">
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} required>
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Class</label>
                    <select name="student_class" value={formData.student_class} onChange={handleChange} required>
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
                {/* Mevcut fotoğraf yükleme alanı */}
                <div className="form-group">
                    <label>Student Image</label>
                    <input type="file" name="image" onChange={handleImageChange} />
                </div>
                <button type="submit" className="submit-button">Edit</button>
            </form>
        </div>
    );
};

export default EditStudentPage;