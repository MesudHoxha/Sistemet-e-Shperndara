import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ExamOfficerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '800px',
      margin: 'auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#212529'
    },
    subtitle: {
      fontSize: '16px',
      color: '#555',
      marginBottom: '30px'
    },
    info: {
      textAlign: 'left',
      marginBottom: '30px',
      lineHeight: '1.6',
      color: '#333'
    },
    button: {
      padding: '12px 20px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'background-color 0.3s ease'
    },
    logoutButton: {
      backgroundColor: '#dc3545'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎓 Paneli i Oficerit të Provimeve</h2>

      <div style={styles.info}>
        
    <h4 style={styles.profileTitle}>👤 Profili i Exam-Officer-it</h4>
    <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Roli:</strong> {user?.role}</p>
      </div>
      <p style={styles.subtitle}>Zgjidh një veprim më poshtë:</p>
      <button onClick={() => navigate('/exam/manage')} style={styles.button}>
        📝 Menaxho Provimet
      </button>

      <br />
      <button onClick={logout} style={{ ...styles.button, ...styles.logoutButton }}>
        🚪 Dil nga llogaria
      </button>
    </div>
  );
};

export default ExamOfficerDashboard;
