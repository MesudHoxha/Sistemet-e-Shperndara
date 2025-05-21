import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScholarshipWinners = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [filter, setFilter] = useState('');

  const headers = {
    Authorization: `Bearer ${authTokens.access}`
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/scholarships/', { headers });
      setScholarships(res.data.reverse());
    } catch (err) {
      console.error("❌ Gabim në marrjen e bursave:", err);
    }
  };

  const filteredScholarships = scholarships.filter(s =>
    [s.student_name, s.scholarship_type, s.amount, s.awarded_date]
      .join(' ') 
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '900px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '25px',
      color: '#212529',
      textAlign: 'center',
    },
    input: {
      marginBottom: '20px',
      padding: '10px',
      width: '100%',
      borderRadius: '6px',
      border: '1px solid #ced4da',
      fontSize: '16px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#28a745',
      color: '#fff',
      padding: '12px',
      textAlign: 'left',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6',
    },
    rowAlt: {
      backgroundColor: '#f8f9fa',
    },
    backButton: {
      marginTop: '30px',
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Studentët që kanë fituar Bursë</h2>

      <input
        type="text"
        placeholder="🔍 Filtro studentët, llojin, shumën ose datën..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={styles.input}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Emri i Studentit</th>
            <th style={styles.th}>Muaji</th>
            <th style={styles.th}>Shuma (€)</th>
            <th style={styles.th}>Data e Dhënies</th>
          </tr>
        </thead>
        <tbody>
          {filteredScholarships.map((s, index) => (
            <tr key={s.id} style={index % 2 === 0 ? {} : styles.rowAlt}>
              <td style={styles.td}>{s.student_name}</td>
              <td style={styles.td}>{s.scholarship_type}</td>
              <td style={styles.td}>€ {s.amount}</td>
              <td style={styles.td}>{s.awarded_date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={styles.backButton} onClick={() => navigate(-1)}>🔙 Kthehu</button>
    </div>
  );
};

export default ScholarshipWinners;
