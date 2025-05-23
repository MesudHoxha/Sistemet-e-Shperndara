import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AvailableBooks = () => {
  const { authTokens } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [editCopies, setEditCopies] = useState({});
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/books/', { headers });
      // Mos filtro sipas copies – mbaj të gjithë për filtrim më poshtë
      setBooks(res.data);
    } catch (err) {
      console.error("Gabim në marrjen e librave:", err);
      setMessage("❌ Gabim në ngarkimin e librave.");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleUpdateCopies = async (bookId) => {
    const newCopies = parseInt(editCopies[bookId]);
    if (isNaN(newCopies)) {
      setMessage("❌ Numër i pavlefshëm.");
      return;
    }
  
    const book = books.find(b => b.id === bookId);
    if (!book) {
      setMessage("❌ Libri nuk u gjet.");
      return;
    }
  
    try {
      if (newCopies === 0) {
        const confirmDelete = window.confirm("⚠️ Dëshironi të vendosni 0 kopje? Libri do të largohet vetëm nëse nuk është në përdorim.");
        if (!confirmDelete) return;
  
        if (book.total_copies === book.available_copies) {
          await axios.delete(`http://127.0.0.1:8000/api/v1/books/${bookId}/`, { headers });
          setMessage("🗑️ Libri u fshi me sukses.");
          fetchBooks();
          return;
        }
      }
  
      const updatePayload = {
  available_copies: newCopies,
  total_copies: newCopies
};

  
      // nëse kopjet janë rritur dhe total_copies duhet përditësuar
      if (newCopies > book.total_copies) {
        updatePayload.total_copies = newCopies;
      }
  
      await axios.patch(`http://127.0.0.1:8000/api/v1/books/${bookId}/`, updatePayload, { headers });
  
      setMessage("✅ Kopjet u përditësuan me sukses.");
      setEditCopies({});
      fetchBooks();
  
    } catch (err) {
      console.error("Gabim gjatë përditësimit të kopjeve:", err);
      setMessage("❌ Gabim gjatë përditësimit të kopjeve.");
    }
  };
  

  const filteredBooks = books
    .filter(book =>
      (book.title.toLowerCase().includes(searchTerm) ||
       book.author.toLowerCase().includes(searchTerm))
    )
    .filter(book =>
      !(book.available_copies === 0 && book.total_copies === 0)
    ); // largojmë vetëm librat jo në përdorim e pa kopje

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' },
    message: { marginTop: '10px', color: message.includes("✅") ? 'green' : 'red' },
    backBtn: { marginTop: '30px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    searchInput: { padding: '10px', width: '100%', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' },
    input: { width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' },
    editButton: { padding: '6px 12px', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <h3>📖 Librat në Bibliotekë</h3>
      {message && <p style={styles.message}>{message}</p>}

      <input
        type="text"
        placeholder="Kërko sipas titullit ose autorit..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={styles.searchInput}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Titulli</th>
            <th style={styles.th}>Autori</th>
            <th style={styles.th}>Kopje në dispozicion</th>
            <th style={styles.th}>Ndrysho</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map(book => (
            <tr key={book.id}>
              <td style={styles.td}>{book.title}</td>
              <td style={styles.td}>{book.author}</td>
              <td style={styles.td}>{book.available_copies}</td>
              <td style={styles.td}>
                {editCopies[book.id] !== undefined ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      value={editCopies[book.id]}
                      onChange={(e) =>
                        setEditCopies({ ...editCopies, [book.id]: e.target.value })
                      }
                      style={styles.input}
                    />
                    <button
                      onClick={() => handleUpdateCopies(book.id)}
                      style={{
                        ...styles.editButton,
                        backgroundColor: '#28a745'
                      }}
                    >
                      💾 Ruaj
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...editCopies };
                        delete updated[book.id];
                        setEditCopies(updated);
                      }}
                      style={{
                        ...styles.editButton,
                        backgroundColor: '#6c757d',
                        marginLeft: '5px'
                      }}
                    >
                      ❌ Anulo
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditCopies({ ...editCopies, [book.id]: book.available_copies })
                    }
                    style={{
                      ...styles.editButton,
                      backgroundColor: '#ffc107'
                    }}
                  >
                    ✏️ Ndrysho
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>🔙 Kthehu</button>
    </div>
  );
};

export default AvailableBooks;
