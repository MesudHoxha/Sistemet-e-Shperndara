import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';
const FinanceDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
      marginBottom: '20px',
      color: '#212529',
    },
    info: {
      marginBottom: '30px',
      fontSize: '16px',
      color: '#333',
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '15px',
      justifyContent: 'center',
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
    
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💼 Paneli i Financës</h2>

      <div style={styles.profileBox}>
  <h4 style={styles.profileTitle}>👤 Profili i Financës</h4>
  <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
  <p><strong>Email:</strong> {user?.email}</p>
  <p><strong>Roli:</strong> {user?.role}</p>
</div>

<p style={styles.subtitle}>Zgjidh një veprim më poshtë:</p>
      <div style={styles.buttonGrid}>
        <button style={styles.button} onClick={() => navigate('/finance/payments')}>
          💰 Menaxho Pagat e Stafit
        </button>
        <button style={styles.button} onClick={() => navigate('/finance/payment-history')}>
          📄 Shiko Historinë e Pagesave
        </button>
        <button style={styles.button} onClick={() => navigate('/finance/scholarship-openings')}>
          🗓️ Hap Aplikime për Bursë
        </button>
        <button style={styles.button} onClick={() => navigate('/finance/scholarships')}>
          🎓 Menaxho Aplikimet për Bursë
        </button>
        <button style={styles.button} onClick={() => navigate('/finance/scholarship-winners')}>
          📜 Shfaq Fituesit e Bursave
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

export default FinanceDashboard;
