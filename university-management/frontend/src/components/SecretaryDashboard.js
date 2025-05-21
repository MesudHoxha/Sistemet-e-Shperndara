import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
function SecretaryDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/secretaries/', {
        headers: getHeaders(),
      });

      const secretary = res.data.find((s) => s.email === user.email);

      if (secretary && secretary.faculty) {
        const facultyRes = await axios.get(`http://127.0.0.1:8000/api/v1/faculties/${secretary.faculty}/`, {
          headers: getHeaders(),
        });
        secretary.faculty_name = facultyRes.data.name;
      }

      setProfile(secretary);
    } catch (err) {
      console.error('❌ Gabim në marrjen e profilit të sekretarit', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>⏳ Po ngarkohet profili...</p>;
  if (!profile) return <p>❌ Profili nuk u gjet.</p>;

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '900px',
      margin: 'auto',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    infoBox: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    infoText: {
      lineHeight: '1.8',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '20px 0 10px',
    },
    button: {
      padding: '12px 18px',
      fontSize: '16px',
      margin: '8px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      marginTop: '30px',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Paneli i Sekretarisë</h2>

      <div style={styles.infoBox}>
        <div style={styles.infoText}>
        <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Roli:</strong> {user?.role}</p>
          <p><strong>Fakulteti:</strong> {profile.faculty_name}</p>
        </div>
      </div>

      <p style={styles.sectionTitle}>Zgjidh një veprim më poshtë:</p>

      <div>
        <button style={styles.button} onClick={() => navigate('/secretary/departments')}>
          🏛️ Menaxho Departamentet
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/subjects')}>
          📘 Menaxho Lëndët
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/students')}>
          👥 Shfaq Studentët
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/add-student')}>
          ➕ Shto Student të Ri
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/professors')}>
          👨‍🏫 Shfaq Profesorët
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/buildings')}>
          🏢 Menaxho Ndërtesat
        </button>
        <button style={styles.button} onClick={() => navigate('/secretary/add-library')}>
          📚 Krijo Bibliotekë
        </button>
      </div>
      <ChangePasswordForm />

      <button style={{ ...styles.button, ...styles.logoutButton }} onClick={logout}>
        🚪 Dil nga llogaria
      </button>
    </div>
  );
}

export default SecretaryDashboard;
