import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddBookSection = () => {
  const { authTokens, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    available_copies: '',
    library: ''
  });

  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchLibraryForLibrarian();
  }, []);

  const fetchLibraryForLibrarian = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/librarians/", { headers });
      const librarian = res.data.find(lib => lib.email === user.email);
      if (librarian && librarian.library) {
        setNewBook(prev => ({ ...prev, library: librarian.library }));
      } else {
        setMessage("❌ Nuk u gjet asnjë bibliotekë për këtë përdorues.");
      }
    } catch (err) {
      console.error("❌ Gabim në marrjen e bibliotekës:", err);
      setMessage("❌ Gabim në ngarkimin e të dhënave.");
    }
  };

  const handleAddBook = async () => {
    const { title, author, isbn, available_copies, library } = newBook;
    if (!title || !author || !isbn || !available_copies || !library) {
      setMessage("❗ Plotësoni të gjitha fushat.");
      return;
    }
  
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/books/', {
        title,
        author,
        isbn,
        available_copies: parseInt(available_copies),
        total_copies: parseInt(available_copies),  // 👈 kjo është pjesa e re
        library
      }, { headers });
  
      setMessage("✅ Libri u shtua me sukses!");
      setNewBook(prev => ({
        ...prev,
        title: '',
        author: '',
        isbn: '',
        available_copies: ''
      }));
    } catch (err) {
      console.error("Gabim në shtimin e librit:", err);
      setMessage("❌ Gabim gjatë shtimit të librit.");
    }
  };
  

  const styles = {
    container: {
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    label: { display: 'block', marginTop: '10px', fontWeight: 'bold' },
    input: { padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' },
    button: { padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    message: { marginTop: '15px', color: message.includes("✅") ? 'green' : 'red' },
    backButton: { marginTop: '20px', backgroundColor: '#6c757d' }
  };

  return (
    <div style={styles.container}>
      <h3>➕ Shto Libër të Ri</h3>

      <label style={styles.label}>Titulli:</label>
      <input
        type="text"
        style={styles.input}
        value={newBook.title}
        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
      />

      <label style={styles.label}>Autori:</label>
      <input
        type="text"
        style={styles.input}
        value={newBook.author}
        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
      />

      <label style={styles.label}>ISBN:</label>
      <input
        type="text"
        style={styles.input}
        value={newBook.isbn}
        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
      />

      <label style={styles.label}>Kopje në dispozicion:</label>
      <input
        type="number"
        style={styles.input}
        value={newBook.available_copies}
        onChange={(e) => setNewBook({ ...newBook, available_copies: e.target.value })}
      />

      <button onClick={handleAddBook} style={styles.button}>📥 Shto Librin</button>

      {message && <p style={styles.message}>{message}</p>}

      <button style={{ ...styles.button, ...styles.backButton }} onClick={() => navigate(-1)}>🔙 Kthehu</button>
    </div>
  );
};

export default AddBookSection;
