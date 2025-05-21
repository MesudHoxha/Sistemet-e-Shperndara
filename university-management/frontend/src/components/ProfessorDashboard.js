import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';
import axios from 'axios';

const ProfessorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [facultyName, setFacultyName] = useState(null);

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/professors/', {
          headers: getHeaders(),
        });

        const professor = res.data.find((p) => p.email === user.email);

        if (professor && professor.faculty) {
          const facultyRes = await axios.get(
            `http://localhost:8000/api/v1/faculties/${professor.faculty}/`,
            { headers: getHeaders() }
          );
          setFacultyName(facultyRes.data.name);
        }
      } catch (err) {
        console.error('Gabim në ngarkimin e fakultetit të profesorit:', err);
      }
    };

    if (user?.email) fetchFaculty();
  }, [user]);

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
      <h2 style={styles.title}>🎓 Paneli i Profesorit</h2>

      <div style={styles.profileBox}>
        <h4 style={styles.profileTitle}>👤 Profili i Profesorit</h4>
        <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Roli:</strong> {user?.role}</p>
        <p><strong>Fakulteti:</strong> {facultyName || '...'}</p>

      </div>

      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={() => navigate('/professor/submissions')}>
          📋 Shiko Paraqitjet e Provimeve
        </button>
        <button style={styles.button} onClick={() => navigate('/professor/grades')}>
          📝 Vendos Nota për Lëndët
        </button>
        <button style={styles.button} onClick={() => navigate('/professor/schedule')}>
          🕘 Menaxho Orarin e Lëndëve
        </button>
        <button style={styles.button} onClick={() => navigate('/professor/attendance')}>
          📊 Regjistro Vijueshmërinë
        </button>
      </div>
      <ChangePasswordForm />

      <button
        onClick={logout}
        style={{ ...styles.button, ...styles.logoutButton }}
      >
        🚪 Dil nga llogaria
      </button>
    </div>
  );
};

export default ProfessorDashboard;
