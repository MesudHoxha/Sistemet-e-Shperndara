import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facultyName, setFacultyName] = useState('');
  const [departmentName, setDepartmentName] = useState('');

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/students/', {
        headers: getHeaders(),
      });
      const student = res.data.find((s) => s.email === user.email);
      setStudentInfo(student);

      if (student.faculty) {
        const facultyRes = await axios.get(`http://localhost:8000/api/v1/faculties/${student.faculty}/`, {
          headers: getHeaders(),
        });
        setFacultyName(facultyRes.data.name);
      }

      if (student.department) {
        const departmentRes = await axios.get(`http://localhost:8000/api/v1/departments/${student.department}/`, {
          headers: getHeaders(),
        });
        setDepartmentName(departmentRes.data.name);
      }
    } catch (err) {
      console.error('Gabim në ngarkimin e të dhënave të studentit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Po ngarkohen të dhënat...</p>;
  if (!studentInfo) return <p>Të dhënat nuk u gjetën.</p>;

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '800px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#212529',
    },
    profileBox: {
      textAlign: 'left',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    profileTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#343a40',
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '20px',
    },
    button: {
      padding: '14px 20px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      marginTop: '30px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎓 Paneli i Studentit</h2>

      <div style={styles.profileBox}>
        <h4 style={styles.profileTitle}>👤 Profili i Studentit</h4>
        <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {studentInfo.email}</p>
        <p><strong>Roli:</strong> {user?.role}</p>
        <p><strong>Fakulteti:</strong> {facultyName}</p>
        <p><strong>Departamenti:</strong> {departmentName}</p>
      </div>

      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={() => navigate('/student/enroll')}>
          📚 Regjistrohu në Lëndë
        </button>
        <button style={styles.button} onClick={() => navigate('/student/exam-submissions')}>
          📤 Paraqit Provim
        </button>
        <button style={styles.button} onClick={() => navigate('/student/grades')}>
          📝 Shiko Notat
        </button>
        <button style={styles.button} onClick={() => navigate('/student/schedule')}>
          🕘 Orari i Lëndëve
        </button>
        <button style={styles.button} onClick={() => navigate('/student/attendance')}>
          📊 Vijueshmëria
        </button>
        <button style={styles.button} onClick={() => navigate('/student/scholarship')}>
          🎓 Apliko për Bursë
        </button>
      </div>
      <ChangePasswordForm />

      <button onClick={logout} style={{ ...styles.button, ...styles.logoutButton }}>
        🚪 Dil nga llogaria
      </button>
    </div>
  );
};

export default StudentDashboard;
