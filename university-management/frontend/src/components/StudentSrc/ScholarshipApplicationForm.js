import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScholarshipApplicationForm = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [applied, setApplied] = useState(false);
  const [canApply, setCanApply] = useState(false);
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    checkOpenings();
    fetchApplications();
  }, []);

  const checkOpenings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/scholarship-openings/", { headers });
      const found = res.data.find(open => open.month === currentMonth);
      setCanApply(!!found);
    } catch (err) {
      console.error("❌ Gabim në kontrollin e bursës:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/scholarship-applications/", { headers });
      setApplications(res.data);
      const monthNow = new Date().getMonth(); // 0-11
const yearNow = new Date().getFullYear();

if (res.data.some(app => {
  const appDate = new Date(app.month);
  return appDate.getMonth() === monthNow && appDate.getFullYear() === yearNow;
})) {
  setApplied(true);
}

    } catch (err) {
      console.error("❌ Gabim në marrjen e aplikimeve:", err);
    }
  };

  const handleApply = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/scholarship-applications/', { month: currentMonth }, { headers });
      setApplied(true);
      setMessage("✅ Aplikimi për bursë u regjistrua me sukses.");
      fetchApplications();
    } catch (err) {
  console.error("❌ Gabim në aplikim:", err);
  const msg = err.response?.data?.detail ||
            Object.values(err.response?.data || {}).join(', ') ||
            "❌ Gabim gjatë aplikimit për bursë.";
setMessage(msg);

}

  };

  // Stilimi i njëtrajtshëm
  const inputStyle = {
    display: 'block',
    marginBottom: '12px',
    padding: '8px 12px',
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  };

  const btnPrimary = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const btnLogout = {
    marginTop: '30px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0,0,0,0.05)',
    marginTop: '30px',
  };

  const tableHeaderStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  };

  const tableCellStyle = {
    padding: '10px',
    borderBottom: '1px solid #ccc',
  };

  const emptyStyle = {
    fontStyle: 'italic',
    color: '#666',
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' }}>
      <h2>🎓 Paneli i Studentit</h2>
      <h3>💸 Apliko për Bursë</h3>

      <p><strong>📅 Muaji aktual:</strong> {currentMonth}</p>

      {canApply ? (
        <button onClick={handleApply} disabled={applied} style={btnPrimary}>
          {applied ? "✔️ Aplikuar" : "📨 Apliko për këtë muaj"}
        </button>
      ) : (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'red' }}>
          ❌ Aplikimi për këtë muaj nuk është hapur ende.
        </p>
      )}

      {message && (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <hr style={{ margin: '40px 0' }} />

      <div style={cardStyle}>
        <h4>📋 Aplikimet e mia për bursë</h4>

        {applications.length === 0 ? (
          <p style={emptyStyle}>Nuk keni ende aplikime për bursë.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Muaji</th>
                <th style={tableHeaderStyle}>Statusi</th>
                <th style={tableHeaderStyle}>Shuma e Bursës</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td style={tableCellStyle}>{app.month}</td>
                  <td style={tableCellStyle}>
  {app.awarded
    ? '✅ Fitues'
    : app.is_approved === false
    ? '❌ Refuzuar'
    : '⏳ Në shqyrtim'}
</td>

                  <td style={tableCellStyle}>
                    {app.awarded ? `${app.amount} €` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={() => navigate('/student')} style={btnLogout}>
        🔙 Kthehu te Paneli i Studentit
      </button>
    </div>
  );
};

export default ScholarshipApplicationForm;
