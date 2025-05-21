import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function LibrarianManagement() {
  const { logout } = useContext(AuthContext);
  const [librarians, setLibrarians] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    library: '',
  });

  const [newLibrarian, setNewLibrarian] = useState({
    first_name: '',
    last_name: '',
    library: '',
  });

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchLibrarians();
    fetchLibraries();
  }, []);

  const fetchLibrarians = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/librarians/', {
        headers: getHeaders(),
      });
      setLibrarians(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e librarianëve', err);
    }
  };

  const fetchLibraries = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/libraries/', {
        headers: getHeaders(),
      });
      setLibraries(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e bibliotekave', err);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm('A dëshiron ta fshish këtë librarian?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/librarians/${id}/`, {
          headers: getHeaders(),
        });
        fetchLibrarians();
      } catch (err) {
        console.error('Gabim gjatë fshirjes', err);
      }
    }
  };

  const handleEdit = (lib) => {
    setEditing(lib);
    setFormData({
      first_name: lib.first_name,
      last_name: lib.last_name,
      email: lib.email,
      library: lib.library || '',
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/v1/librarians/${editing.id}/`,
        {
          first_name: formatName(formData.first_name),
          last_name: formatName(formData.last_name),
          library: formData.library || null,
        },
        { headers: getHeaders() }
      );
      setEditing(null);
      fetchLibrarians();
    } catch (err) {
      console.error('Gabim në përditësim', err);
    }
  };

  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/v1/librarians/',
        {
          first_name: formatName(newLibrarian.first_name),
          last_name: formatName(newLibrarian.last_name),
          library: newLibrarian.library || null,
        },
        { headers: getHeaders() }
      );
      alert('Librariani u shtua me sukses!');
      setNewLibrarian({ first_name: '', last_name: '', library: ''});
      fetchLibrarians();
    } catch (err) {
      console.error('Gabim në krijim', err);
    }
  };

  const filtered = librarians.filter((lib) =>
    [lib.first_name, lib.last_name, lib.email, lib.hire_date]
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );
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
  
  const btnSecondary = {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
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
  
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '10px' }}>🎓 Paneli i Administratorit</h2>
      <h3 style={{ marginBottom: '30px' }}>📚 Librarianët</h3>
  
      <input
        type="text"
        placeholder="🔍 Filtro librarianët..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, width: '320px' }}
      />
  
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e1e7ef', textAlign: 'left' }}>
            {['ID', 'Emri', 'Mbiemri', 'Email', 'Biblioteka', 'Data Punësimit', 'Veprime'].map((h, i) => (
              <th key={i} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((lib) => (
            <tr key={lib.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{lib.id}</td>
              <td style={{ padding: '10px' }}>{lib.first_name}</td>
              <td style={{ padding: '10px' }}>{lib.last_name}</td>
              <td style={{ padding: '10px' }}>{lib.email}</td>
              <td style={{ padding: '10px' }}>
                {libraries.find(l => l.id === lib.library)?.name || '-'}
              </td>
              <td style={{ padding: '10px' }}>
                {lib.hire_date
                  ? format(new Date(lib.hire_date), 'dd MMMM yyyy', { locale: enGB })
                  : ''}
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEdit(lib)} style={{ padding: '6px 10px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(lib.id)} style={{ padding: '6px 10px', cursor: 'pointer' }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {editing && (
        <div style={cardStyle}>
          <h4>✏️ Ndrysho Librarianin</h4>
          <input
            placeholder="Emri"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Mbiemri"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            style={inputStyle}
          />
          <select
            value={formData.library}
            onChange={(e) => setFormData({ ...formData, library: e.target.value })}
            style={inputStyle}
          >
            <option value="">Zgjedh bibliotekën</option>
            {libraries.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input
            placeholder="Email"
            value={formData.email}
            disabled
            style={{ ...inputStyle, backgroundColor: '#f0f0f0' }}
          />
          <button onClick={handleUpdate} style={btnPrimary}>💾 Ruaj</button>
          <button onClick={() => setEditing(null)} style={{ ...btnSecondary, marginLeft: '10px' }}>Anulo</button>
        </div>
      )}
  
      <div style={cardStyle}>
        <h4>➕ Shto Librarian të Ri</h4>
        <input
          placeholder="Emri"
          value={newLibrarian.first_name}
          onChange={(e) => setNewLibrarian({ ...newLibrarian, first_name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Mbiemri"
          value={newLibrarian.last_name}
          onChange={(e) => setNewLibrarian({ ...newLibrarian, last_name: e.target.value })}
          style={inputStyle}
        />
        <select
          value={newLibrarian.library}
          onChange={(e) => setNewLibrarian({ ...newLibrarian, library: e.target.value })}
          style={inputStyle}
        >
          <option value="">Zgjedh bibliotekën</option>
          {libraries.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button onClick={handleCreate} style={btnPrimary}>📥 Shto Librarian</button>
      </div>
  
      <button onClick={() => navigate('/admin')} style={btnLogout}>
  🔙 Kthehu te Paneli i Administratorit
</button>

    </div>
  );
  
}

export default LibrarianManagement;