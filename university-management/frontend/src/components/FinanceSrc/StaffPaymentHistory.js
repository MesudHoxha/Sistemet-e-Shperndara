import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StaffPaymentHistory = () => {
  const { authTokens } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/v1/staff-payments/', {
          headers: {
            Authorization: `Bearer ${authTokens.access}`
          }
        });
        setPayments(res.data.reverse());
      } catch (err) {
        console.error("❌ Gabim në marrjen e pagesave:", err);
      }
    };

    fetchPayments();
  }, []);

  const uniqueMonths = [...new Set(payments.map(p => p.month))];

  const filtered = payments.filter((p) => {
    return (
      p.full_name.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterRole ? p.role === filterRole : true) &&
      (filterMonth ? p.month === filterMonth : true)
    );
  });

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '1100px',
      margin: 'auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '20px',
      textAlign: 'center'
    },
    filters: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    input: {
      padding: '10px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #ccc',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#007bff',
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
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 Historia e Pagesave të Stafit</h2>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Kërko emër..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={styles.input}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={styles.input}
        >
          <option value="">🎭 Roli</option>
          <option value="professor">Profesor</option>
          <option value="secretary">Sekretar</option>
          <option value="librarian">Librarian</option>
          <option value="exam_officer">Exam Officer</option>
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={styles.input}
        >
          <option value="">🗓️ Muaji</option>
          {uniqueMonths.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Emri i plotë</th>
            <th style={styles.th}>Roli</th>
            <th style={styles.th}>Muaji</th>
            <th style={styles.th}>Shuma (€)</th>
            <th style={styles.th}>Data e Pagesës</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, index) => (
            <tr key={p.id} style={index % 2 === 0 ? {} : styles.rowAlt}>
              <td style={styles.td}>{p.full_name}</td>
              <td style={styles.td}>{p.role}</td>
              <td style={styles.td}>{p.month}</td>
              <td style={styles.td}>€ {p.amount}</td>
              <td style={styles.td}>{p.payment_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffPaymentHistory;
