import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useNavigate } from 'react-router-dom';

const LibrarianDashboard = () => {
  const { authTokens, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchBooks();
    fetchStudents();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/books/', { headers });
      setBooks(res.data);
    } catch (err) {
      console.error("Gabim ne librat:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/students/', { headers });
      setStudents(res.data);
    } catch (err) {
      console.error("Gabim ne studentet:", err);
    }
  };

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '800px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#212529'
    },
    info: {
      marginBottom: '30px',
      lineHeight: '1.8',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px'
    },
    button: {
      padding: '12px 18px',
      fontSize: '16px',
      margin: '10px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease'
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 Paneli i Bibliotekarit</h2>

      <div style={styles.info}>
      <p><strong>Emri i përdoruesit:</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Roli:</strong> {user?.role}</p>
      </div>

      <p><strong>Zgjidh një veprim:</strong></p>
      <div style={{ textAlign: 'center' }}>
        <button style={styles.button} onClick={() => navigate('/librarian/add-book')}>
          ➕ Shto Libër të Ri
        </button>
        <button style={styles.button} onClick={() => navigate('/librarian/available-books')}>
          📖 Lista e Librave të Lirë
        </button>
        <button style={styles.button} onClick={() => navigate('/librarian/loan-book')}>
          📤 Jep Libër Studentit
        </button>
        <button style={styles.button} onClick={() => navigate('/librarian/borrowed-books')}>
          📋 Librat e Marrë (me Dorëzim)
        </button>

        <br />
        <button style={{ ...styles.button, ...styles.logoutButton }} onClick={logout}>
          🚪 Dil nga llogaria
        </button>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
