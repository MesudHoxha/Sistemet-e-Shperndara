import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScholarshipOpeningManager = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openings, setOpenings] = useState([]);
  const [newMonth, setNewMonth] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const getHeaders = () => ({
    Authorization: `Bearer ${authTokens.access}`,
  });

  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/scholarship-openings/', {
        headers: getHeaders()
      });
      setOpenings(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e hapjeve:", err);
    }
  };

  const handleCreate = async () => {
    if (!newMonth || !newAmount || isNaN(newAmount)) {
      alert("⛔ Plotëso muajin dhe shumën në mënyrë valide.");
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/scholarship-openings/', {
        month: newMonth,
        amount: parseFloat(newAmount)
      }, {
        headers: getHeaders()
      });

      setNewMonth('');
      setNewAmount('');
      fetchOpenings();
    } catch (err) {
      console.error("❌ Gabim në krijimin e hapjes:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/scholarship-openings/${id}/`, {
        headers: getHeaders()
      });
      fetchOpenings();
    } catch (err) {
      console.error("❌ Gabim në fshirje:", err);
    }
  };

  const generateNext12Months = () => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const future = new Date(now.getFullYear(), now.getMonth() + i);
      const label = future.toLocaleString('default', { month: 'long', year: 'numeric' });
      months.push(label);
    }

    return months;
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📅 Menaxho Muajt për Aplikime të Bursës</h2>

      <div style={formRow}>
        <select
          value={newMonth}
          onChange={(e) => setNewMonth(e.target.value)}
          style={selectStyle}
        >
          <option value="">Zgjedh muajin</option>
          {generateNext12Months()
            .filter(month => !openings.some(open => open.month === month))
            .map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
        </select>

        <input
          type="number"
          placeholder="Shuma (€)"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleCreate} style={primaryButton}>➕ Hap</button>
      </div>

      <h3 style={subtitleStyle}>📂 Muajt e hapur:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {openings.map(open => (
          <li key={open.id} style={listItem}>
            <span><strong>{open.month}</strong> – 💶 {open.amount} €</span>
            <button onClick={() => handleDelete(open.id)} style={dangerButton}>❌</button>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate(-1)} style={backButton}>🔙 Kthehu</button>
    </div>
  );
};

const containerStyle = {
  padding: '40px',
  maxWidth: '800px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  fontFamily: 'Arial, sans-serif',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#212529',
};

const formRow = {
  display: 'flex',
  gap: '10px',
  marginBottom: '25px',
};

const selectStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ced4da',
  flex: 1,
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ced4da',
  width: '150px',
};

const primaryButton = {
  padding: '10px 16px',
  fontSize: '16px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const dangerButton = {
  padding: '6px 12px',
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const subtitleStyle = {
  marginTop: '30px',
  fontSize: '18px',
  color: '#343a40',
  marginBottom: '10px',
};

const listItem = {
  padding: '12px',
  borderBottom: '1px solid #dee2e6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const backButton = {
  marginTop: '40px',
  padding: '10px 20px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default ScholarshipOpeningManager;
