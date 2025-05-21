import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoanBook = () => {
  const { authTokens } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookRes, studentRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/books/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/students/', { headers }),
      ]);
      const availableBooks = bookRes.data.filter(b => b.available_copies > 0);
      setBooks(availableBooks);
      setStudents(studentRes.data);
    } catch (err) {
      console.error("Gabim në ngarkim:", err);
      setMessage("❌ Gabim në ngarkimin e të dhënave.");
    }
  };

  const handleLoan = async () => {
    if (!selectedBook || !selectedStudent) {
      setMessage("❗ Ju lutem zgjidhni librin dhe studentin.");
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/book-loans/', {
        book: selectedBook,
        student: selectedStudent,
      }, { headers });

      setMessage("📤 Libri iu dha studentit me sukses!");
      setSelectedBook('');
      setSelectedStudent('');
      setSearchTerm('');
      fetchData();
    } catch (err) {
      console.error("Gabim në huazim:", err);
      setMessage("❌ Gabim gjatë huazimit të librit.");
    }
  };

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    heading: {
      fontSize: '22px',
      marginBottom: '20px',
      color: '#333'
    },
    select: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginRight: '10px'
    },
    message: {
      marginTop: '15px',
      color: message.includes("📤") ? 'green' : 'red'
    },
    back: {
      backgroundColor: '#6c757d',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>📤 Jep Libër Studentit</h3>

      <label>Librat:</label>
      <select style={styles.select} value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}>
        <option value="">Zgjedh librin</option>
        {books.map(b => (
          <option key={b.id} value={b.id}>{b.title} — {b.available_copies} kopje</option>
        ))}
      </select>

      <label>Kërko studentin:</label>
      <input
        type="text"
        placeholder="🔍 ID ose emër/mbiemër"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.select}
      />

      <select style={styles.select} value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
        <option value="">Zgjedh studentin</option>
        {students
          .filter(s =>
            `${s.id} ${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(s => (
            <option key={s.id} value={s.id}>
              {s.id} — {s.first_name} {s.last_name}
            </option>
        ))}
      </select>

      <button style={styles.button} onClick={handleLoan}>📤 Jep</button>
      <button style={{ ...styles.button, ...styles.back }} onClick={() => navigate(-1)}>🔙 Kthehu</button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

export default LoanBook;
