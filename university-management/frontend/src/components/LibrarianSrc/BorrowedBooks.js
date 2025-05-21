import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BorrowedBooks = () => {
  const { authTokens } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/book-loans/', { headers });
      const onlyActive = res.data.filter(loan => !loan.returned);
      setBorrowedBooks(onlyActive);
    } catch (err) {
      console.error("Gabim në ngarkimin e huazimeve:", err);
      setMessage("❌ Gabim gjatë marrjes së librave të huazuar.");
    }
  };

  const handleReturn = async (loanId) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/book-loans/return/', { loan_id: loanId }, { headers });
      setMessage("📥 Libri u dorëzua me sukses.");
      fetchBorrowedBooks();
    } catch (err) {
      console.error("Gabim në dorëzim:", err);
      setMessage("❌ Gabim gjatë dorëzimit të librit.");
    }
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' },
    button: { padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    back: { marginTop: '30px', backgroundColor: '#6c757d' },
    message: { marginTop: '10px', color: message.includes("📥") ? 'green' : 'red' }
  };

  return (
    <div style={styles.container}>
      <h3>📋 Librat e Marrë nga Studentët</h3>
      {message && <p style={styles.message}>{message}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Titulli</th>
            <th style={styles.th}>Autori</th>
            <th style={styles.th}>Studenti (ID)</th>
            <th style={styles.th}>Dorëzim</th>
          </tr>
        </thead>
        <tbody>
          {borrowedBooks.map(loan => (
            <tr key={loan.id}>
              <td style={styles.td}>{loan.book_title}</td>
              <td style={styles.td}>{loan.book_author}</td>
              <td style={styles.td}>
                {loan.student_id
                  ? `${loan.student_id} — ${loan.student_name}`
                  : `${loan.student} — ${loan.student_name}`
                }
              </td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => handleReturn(loan.id)}>📥 Dorëzo</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ ...styles.button, ...styles.back }} onClick={() => navigate(-1)}>🔙 Kthehu</button>
    </div>
  );
};

export default BorrowedBooks;
