import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

// Django API'nizin temel URL'si
const API_BASE_URL = 'http://127.0.0.1:8000';

const AddStudentPage = () => {
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
        // Yeni eklenen alanlar
        department: '',
        student_class: '',
    });

    // Yeni eklenen state'ler
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form için gerekli olan bölüm ve sınıf verilerini API'den çekme
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchDataForForm = async () => {
            try {
                // Bölümleri çek
                const departmentsResponse = await axios.get(`${API_BASE_URL}/api/departments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setDepartments(departmentsResponse.data);

                // Sınıfları çek
                const classesResponse = await axios.get(`${API_BASE_URL}/api/classes/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setClasses(classesResponse.data);

                setIsLoading(false);
            } catch (err) {
                console.error('Form verileri çekilemedi:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/');
                } else {
                    setError('Bölümler ve sınıflar yüklenirken bir hata oluştu.');
                }
                setIsLoading(false);
            }
        };
        fetchDataForForm();
    }, [navigate]);

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
        if (!token) {
            navigate('/');
            return;
        }

        const data = new FormData();
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        data.append('enrollment_number', formData.enrollment_number);
        data.append('date_of_birth', formData.date_of_birth);
        data.append('gender', formData.gender);
        data.append('phone_number', formData.phone_number);
        if (formData.image) {
            data.append('image', formData.image);
        }
        // Yeni eklenen verileri FormData'ya ekle
        data.append('department', formData.department);
        data.append('student_class', formData.student_class);

        try {
            await axios.post(`${API_BASE_URL}/api/students/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Uyarı mesajı için alert yerine div kullanıldı
            // alert('Öğrenci başarıyla eklendi!');
            navigate('/students', { state: { message: 'Öğrenci başarıyla eklendi!' } });
        } catch (error) {
            console.error('Öğrenci eklenirken bir hata oluştu:', error.response.data);
            // Uyarı mesajı için alert yerine div kullanıldı
            // alert('Ekleme işleminde hata oluştu. Lütfen tüm alanları kontrol edin.');
            setError('Ekleme işleminde hata oluştu. Lütfen tüm alanları kontrol edin.');
        }
    };
    
    if (isLoading) {
        return <div className="loading-container">Veriler Yükleniyor...</div>;
    }

    return (
        <div className="add-student-container">
            <h1 className="page-title">Add Student</h1>
            {error && <div className="error-message">{error}</div>}
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
                {/* YENİ EKLENEN KISIM: Bölüm ve Sınıf Combobox'ları */}
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
                {/* BİTEN YENİ EKLENEN KISIM */}
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Student Image</label>
                    <input type="file" name="image" onChange={handleImageChange} />
                </div>
                <button type="submit" className="submit-button">Add</button>
            </form>
        </div>
    );
};

export default AddStudentPage;