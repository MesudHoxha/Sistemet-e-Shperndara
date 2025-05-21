import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm'; 
function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Add hover styles once when component mounts
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      button:hover {
        background-color: #0056b3 !important;
        transform: translateY(-2px);
      }
      button:active {
        transform: translateY(0px);
      }
      .logout:hover {
        background-color: #c82333 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ✅ Button handlers
  const handleGoToStudents = () => navigate('/admin/students');
  const handleGoToProfessors = () => navigate('/admin/professors');
  const handleGoToSecretaries = () => navigate('/admin/secretaries');
  const handleGoToFinance = () => navigate('/admin/finance');
  const handleGoToLibrarians = () => navigate('/admin/librarians');
  const handleGoToExamOfficers = () => navigate('/admin/exam-officers');

  return (
   
      
      <div style={styles.container}>
      <h2 style={styles.title}>Paneli i Administratorit</h2>
   {/* Profili i adminit */}
   <div style={styles.profileBox}>
    <h4 style={styles.profileTitle}>👤 Profili i Administratorit</h4>
    <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
    <p><strong>Email:</strong> {user?.email}</p>
    <p><strong>Roli:</strong> {user?.role}</p>
  </div>

  {/* Butonat */}


<p style={styles.subtitle}>Zgjidh një veprim më poshtë:</p>
      <div style={styles.buttonGrid}>
        <button onClick={handleGoToStudents} style={styles.button}>
          📚 Menaxho Studentët
        </button>
        <button onClick={handleGoToProfessors} style={styles.button}>
          👨‍🏫 Menaxho Profesorët
        </button>
        <button onClick={handleGoToSecretaries} style={styles.button}>
          📋 Menaxho Sekretarët
        </button>
        <button onClick={handleGoToFinance} style={styles.button}>
          💰 Menaxho Financën
        </button>
        <button onClick={handleGoToLibrarians} style={styles.button}>
          📚 Menaxho Librarianët
        </button>
        <button onClick={handleGoToExamOfficers} style={styles.button}>
          📝 Menaxho Exam Officers
        </button>
      </div>
      <ChangePasswordForm />

      <button onClick={logout} style={{ ...styles.button, ...styles.logoutButton }} className="logout">
        🚪 Dil nga llogaria
      </button>
    </div>

  );
}

// ✅ Styles
const styles = {
  container: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    maxWidth: '900px',
    margin: '50px auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    marginBottom: '40px',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#212529',
  },
  buttonGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  button: {
    padding: '14px 20px',
    minWidth: '220px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: '40px',
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
export default AdminDashboard;
