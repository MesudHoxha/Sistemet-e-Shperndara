import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function SecretaryManagement() {
  const { logout } = useContext(AuthContext);
  const [secretaries, setSecretaries] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const navigate = useNavigate();

  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    faculty: '',
  });

  const [newSecretary, setNewSecretary] = useState({
    first_name: '',
    last_name: '',
    faculty: '',
  });

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchSecretaries();
    fetchFaculties();
  }, []);

  const fetchSecretaries = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/secretaries/', {
        headers: getHeaders(),
      });
      setSecretaries(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e sekretarëve', err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/faculties/', {
        headers: getHeaders(),
      });
      setFaculties(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e fakulteteve', err);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm('A dëshiron ta fshish këtë sekretar?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/secretaries/${id}/`, {
          headers: getHeaders(),
        });
        fetchSecretaries();
      } catch (err) {
        console.error('Gabim gjatë fshirjes', err);
      }
    }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setFormData({
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      faculty: s.faculty || '',
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/v1/secretaries/${editing.id}/`,
        {
          first_name: formatName(formData.first_name),
          last_name: formatName(formData.last_name),
          faculty: formData.faculty || null,
        },
        { headers: getHeaders() }
      );
      setEditing(null);
      fetchSecretaries();
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
        'http://127.0.0.1:8000/api/v1/secretaries/',
        {
          first_name: formatName(newSecretary.first_name),
          last_name: formatName(newSecretary.last_name),
          faculty: newSecretary.faculty || null,
        },
        { headers: getHeaders() }
      );
      alert('Sekretari u shtua me sukses!');
      setNewSecretary({ first_name: '', last_name: '', faculty: '' });
      fetchSecretaries();
    } catch (err) {
      console.error('Gabim në krijim', err);
    }
  };

  const filteredSecretaries = secretaries.filter((s) =>
    [s.first_name, s.last_name, s.email, s.hire_date]
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );
  const inputStyle = {
    display: 'block',
    marginBottom: '10px',
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
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };
  
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '10px' }}>🎓 Paneli i Administratorit</h2>
      <h3 style={{ marginBottom: '30px' }}>📋 Sekretarët</h3>
  
      <input
        type="text"
        placeholder="🔍 Filtro sekretarët..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '8px 12px',
          width: '300px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />
  
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e1e7ef', textAlign: 'left' }}>
            {['ID', 'Emri', 'Mbiemri', 'Email', 'Fakulteti', 'Data Punësimit', 'Veprime'].map((h, i) => (
              <th key={i} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSecretaries.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{s.id}</td>
              <td style={{ padding: '10px' }}>{s.first_name}</td>
              <td style={{ padding: '10px' }}>{s.last_name}</td>
              <td style={{ padding: '10px' }}>{s.email}</td>
              <td style={{ padding: '10px' }}>{faculties.find(f => f.id === s.faculty)?.name || '-'}</td>
              <td style={{ padding: '10px' }}>
                {s.hire_date
                  ? format(new Date(s.hire_date), 'dd MMMM yyyy', { locale: enGB })
                  : ''}
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEdit(s)} style={{ padding: '6px 10px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(s.id)} style={{ padding: '6px 10px', cursor: 'pointer' }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {editing && (
        <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 8px rgba(0,0,0,0.05)' }}>
          <h4>✏️ Ndrysho Sekretarin</h4>
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
            value={formData.faculty}
            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
            style={inputStyle}
          >
            <option value="">Zgjedh fakultetin</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <input
            placeholder="Email"
            value={formData.email}
            disabled
            style={{ ...inputStyle, backgroundColor: '#f0f0f0' }}
          />
          <div style={{ marginTop: '15px' }}>
            <button onClick={handleUpdate} style={btnPrimary}>💾 Ruaj</button>
            <button onClick={() => setEditing(null)} style={{ ...btnSecondary, marginLeft: '10px' }}>Anulo</button>
          </div>
        </div>
      )}
  
      <div style={{ marginTop: '40px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 8px rgba(0,0,0,0.05)' }}>
        <h4>➕ Shto Sekretar të Ri</h4>
        <input
          placeholder="Emri"
          value={newSecretary.first_name}
          onChange={(e) => setNewSecretary({ ...newSecretary, first_name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Mbiemri"
          value={newSecretary.last_name}
          onChange={(e) => setNewSecretary({ ...newSecretary, last_name: e.target.value })}
          style={inputStyle}
        />
        <select
          value={newSecretary.faculty}
          onChange={(e) => setNewSecretary({ ...newSecretary, faculty: e.target.value })}
          style={inputStyle}
        >
          <option value="">Zgjedh fakultetin</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <button onClick={handleCreate} style={btnPrimary}>📥 Shto Sekretar</button>
      </div>
  
      <br />
      <button onClick={() => navigate('/admin')} style={btnLogout}>
  🔙 Kthehu te Paneli i Administratorit
</button>

    </div>
  );
}  

export default SecretaryManagement;
