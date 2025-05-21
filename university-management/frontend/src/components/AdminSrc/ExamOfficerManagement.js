import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function ExamOfficerManagement() {
  const { logout } = useContext(AuthContext);
  const [officers, setOfficers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [newOfficer, setNewOfficer] = useState({
    first_name: '',
    last_name: '',
  });

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/exam-officers/', {
        headers: getHeaders(),
      });
      setOfficers(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e exam officers', err);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm('A dëshiron ta fshish këtë exam officer?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/exam-officers/${id}/`, {
          headers: getHeaders(),
        });
        fetchOfficers();
      } catch (err) {
        console.error('Gabim gjatë fshirjes', err);
      }
    }
  };

  const handleEdit = (o) => {
    setEditing(o);
    setFormData({
      first_name: o.first_name,
      last_name: o.last_name,
      email: o.email,
      faculty: o.faculty || '',
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/v1/exam-officers/${editing.id}/`,
        {
          first_name: formatName(formData.first_name),
          last_name: formatName(formData.last_name),
          faculty: formData.faculty || null,
        },
        { headers: getHeaders() }
      );
      setEditing(null);
      fetchOfficers();
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
        'http://127.0.0.1:8000/api/v1/exam-officers/',
        {
          first_name: formatName(newOfficer.first_name),
          last_name: formatName(newOfficer.last_name),
          faculty: newOfficer.faculty || null,
        },
        { headers: getHeaders() }
      );
      alert('Exam Officer u shtua me sukses!');
      setNewOfficer({ first_name: '', last_name: '', faculty: '' });
      fetchOfficers();
    } catch (err) {
      console.error('Gabim në krijim', err);
    }
  };

  const filtered = officers.filter((o) =>
    [o.first_name, o.last_name, o.email, o.hire_date]
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
      <h3 style={{ marginBottom: '30px' }}>📝 Exam Officers</h3>
  
      <input
        type="text"
        placeholder="🔍 Filtro..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, width: '320px' }}
      />
  
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e1e7ef', textAlign: 'left' }}>
            {['ID', 'Emri', 'Mbiemri', 'Email', 'Data Punësimit', 'Veprime'].map((h, i) => (
              <th key={i} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{o.id}</td>
              <td style={{ padding: '10px' }}>{o.first_name}</td>
              <td style={{ padding: '10px' }}>{o.last_name}</td>
              <td style={{ padding: '10px' }}>{o.email}</td>
              <td style={{ padding: '10px' }}>
                {o.hire_date ? format(new Date(o.hire_date), 'dd MMMM yyyy', { locale: enGB }) : ''}
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEdit(o)} style={{ padding: '6px 10px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(o.id)} style={{ padding: '6px 10px', cursor: 'pointer' }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {editing && (
        <div style={cardStyle}>
          <h4>✏️ Ndrysho Exam Officer</h4>
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
        <h4>➕ Shto Exam Officer</h4>
        <input
          placeholder="Emri"
          value={newOfficer.first_name}
          onChange={(e) => setNewOfficer({ ...newOfficer, first_name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Mbiemri"
          value={newOfficer.last_name}
          onChange={(e) => setNewOfficer({ ...newOfficer, last_name: e.target.value })}
          style={inputStyle}
        />

        <button onClick={handleCreate} style={btnPrimary}>📥 Shto</button>
      </div>
  
      <button onClick={() => navigate('/admin')} style={btnLogout}>
  🔙 Kthehu te Paneli i Administratorit
</button>

    </div>
  );
  
}

export default ExamOfficerManagement;
