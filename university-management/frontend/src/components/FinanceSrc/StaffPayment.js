import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StaffPayment = () => {
  const { authTokens } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const headers = {
    Authorization: `Bearer ${authTokens.access}`
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchStaff();
    fetchPaymentHistory();
  }, []);

  const fetchStaff = async () => {
    try {
      const roles = ['professors', 'secretaries', 'librarians', 'exam-officers'];
      let allStaff = [];

      for (let role of roles) {
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/${role}/`, { headers });
        const roleName = role.replace(/s$/, '').replace('-', '_');

        const formatted = res.data.map(member => ({
          id: member.id,
          full_name: `${member.first_name} ${member.last_name}`,
          role: roleName
        }));

        allStaff = [...allStaff, ...formatted];
      }

      setStaff(allStaff);
    } catch (err) {
      console.error("❌ Gabim në marrjen e stafit:", err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/staff-payments/', { headers });
      setPaymentHistory(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e historikut të pagesave:", err);
    }
  };

  const handlePayment = async (member) => {
    const key = `${member.role}-${member.id}`;
    const amount = payments[key];

    if (!amount || isNaN(amount)) {
      alert("⛔ Vendos një shumë valide për pagën!");
      return;
    }

    const payload = {
      full_name: member.full_name,
      role: member.role,
      month: currentMonth,
      amount: parseFloat(amount)
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/staff-payments/', payload, { headers });
      alert(`✅ Paga për ${member.full_name} u regjistrua.`);
      setPayments({ ...payments, [key]: '' });
      fetchPaymentHistory();
    } catch (err) {
      if (err.response) {
        alert("Gabim: " + JSON.stringify(err.response.data));
      } else {
        console.error("❌ Gabim tjetër:", err.message);
      }
    }
  };

  const uniqueMonths = [...new Set(paymentHistory.map(p => p.month))];

  const filteredStaff = staff.filter((member) => {
    const matchesName = member.full_name.toLowerCase().includes(searchName.toLowerCase());
    const matchesRole = filterRole ? member.role === filterRole : true;

    const hasPaymentInMonth = filterMonth
      ? paymentHistory.some(p => p.full_name === member.full_name && p.month === filterMonth)
      : true;

    return matchesName && matchesRole && hasPaymentInMonth;
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
      marginBottom: '10px',
      color: '#212529',
      textAlign: 'center'
    },
    filters: {
      display: 'flex',
      gap: '10px',
      margin: '20px 0',
      justifyContent: 'center',
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
    },
    button: {
      padding: '6px 12px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💰 Menaxho Pagat për Stafin</h2>
      <p style={{ textAlign: 'center' }}><strong>Muaji aktual:</strong> {currentMonth}</p>

      <div style={styles.filters}>
        <input
          style={styles.input}
          type="text"
          placeholder="🔍 Kërko emër..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select
          style={styles.input}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">🎭 Filtro sipas rolit</option>
          <option value="professor">Profesor</option>
          <option value="secretary">Sekretar</option>
          <option value="librarian">Librarian</option>
          <option value="exam_officer">Exam Officer</option>
        </select>
        <select
          style={styles.input}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">🗓️ Filtro sipas muajit</option>
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
            <th style={styles.th}>Shuma (€)</th>
            <th style={styles.th}>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.map((member, index) => {
            const key = `${member.role}-${member.id}`;
            return (
              <tr key={key} style={index % 2 === 0 ? {} : styles.rowAlt}>
                <td style={styles.td}>{member.full_name}</td>
                <td style={styles.td}>{member.role}</td>
                {paymentHistory.some(p => p.full_name === member.full_name && p.month === currentMonth) ? (
  <>
    <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>✅ E paguar</td>
    <td style={styles.td}>—</td>
  </>
) : (
  <>
    <td style={styles.td}>
      <input
        type="number"
        min="0"
        value={payments[key] || ''}
        onChange={(e) =>
          setPayments({ ...payments, [key]: e.target.value })
        }
        style={styles.input}
      />
    </td>
    <td style={styles.td}>
      <button style={styles.button} onClick={() => handlePayment(member)}>
        💸 Paguaj
      </button>
    </td>
  </>
)}

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StaffPayment;
