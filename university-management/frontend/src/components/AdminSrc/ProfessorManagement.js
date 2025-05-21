import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function ProfessorManagement() {
  const { logout } = useContext(AuthContext);
  const [professors, setProfessors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingProfessor, setEditingProfessor] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    faculty: '',
  });

  const [newProfessor, setNewProfessor] = useState({
    first_name: '',
    last_name: '',
    faculty: '',
  });

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchProfessors();
    fetchFaculties();
  }, []);

  const fetchProfessors = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/professors/', {
        headers: getHeaders(),
      });
      setProfessors(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e profesorëve', err);
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
    if (window.confirm('A dëshiron ta fshish këtë profesor?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/professors/${id}/`, {
          headers: getHeaders(),
        });
        fetchProfessors();
      } catch (err) {
        console.error('Gabim gjatë fshirjes', err);
      }
    }
  };

  const handleEdit = (professor) => {
    setEditingProfessor(professor);
    setFormData({
      first_name: professor.first_name,
      last_name: professor.last_name,
      email: professor.email,
      faculty: professor.faculty?.id,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/v1/professors/${editingProfessor.id}/`,
        {
          ...formData,
          first_name: formatName(formData.first_name),
          last_name: formatName(formData.last_name),
        },
        { headers: getHeaders() }
      );
      setEditingProfessor(null);
      fetchProfessors();
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
        'http://127.0.0.1:8000/api/v1/professors/',
        {
          first_name: formatName(newProfessor.first_name),
          last_name: formatName(newProfessor.last_name),
          faculty: parseInt(newProfessor.faculty),
        },
        { headers: getHeaders() }
      );
      alert('Profesori u shtua me sukses!');
      setNewProfessor({
        first_name: '',
        last_name: '',
        faculty: '',
      });
      fetchProfessors();
    } catch (err) {
      console.error('Gabim në krijim', err);
    }
  };

  const filteredProfessors = professors.filter((p) =>
    [
      p.first_name,
      p.last_name,
      p.email,
      p.faculty_name,
      p.hire_date,
    ]
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
      <h3 style={{ marginBottom: '30px' }}>👨‍🏫 Profesorët</h3>
  
      <input
        type="text"
        placeholder="🔍 Filtro profesorët..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, width: '320px' }}
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
          {filteredProfessors.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{p.id}</td>
              <td style={{ padding: '10px' }}>{p.first_name}</td>
              <td style={{ padding: '10px' }}>{p.last_name}</td>
              <td style={{ padding: '10px' }}>{p.email}</td>
              <td style={{ padding: '10px' }}>{p.faculty_name}</td>
              <td style={{ padding: '10px' }}>
                {p.hire_date ? format(new Date(p.hire_date), 'dd MMMM yyyy', { locale: enGB }) : ''}
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEdit(p)} style={{ padding: '6px 10px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 10px', cursor: 'pointer' }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {editingProfessor && (
        <div style={cardStyle}>
          <h4>✏️ Ndrysho Profesorin</h4>
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
          <select
            value={formData.faculty}
            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
            style={inputStyle}
          >
            <option value="">Zgjedh Fakultetin</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <button onClick={handleUpdate} style={btnPrimary}>💾 Ruaj</button>
          <button onClick={() => setEditingProfessor(null)} style={{ ...btnSecondary, marginLeft: '10px' }}>Anulo</button>
        </div>
      )}
  
      <div style={cardStyle}>
        <h4>➕ Shto Profesor të Ri</h4>
        <input
          placeholder="Emri"
          value={newProfessor.first_name}
          onChange={(e) => setNewProfessor({ ...newProfessor, first_name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Mbiemri"
          value={newProfessor.last_name}
          onChange={(e) => setNewProfessor({ ...newProfessor, last_name: e.target.value })}
          style={inputStyle}
        />
        <select
          value={newProfessor.faculty}
          onChange={(e) => setNewProfessor({ ...newProfessor, faculty: e.target.value })}
          style={inputStyle}
        >
          <option value="">Zgjedh Fakultetin</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
       
        <button onClick={handleCreate} style={btnPrimary}>📥 Shto Profesor</button>
      </div>
  
      <button onClick={() => navigate('/admin')} style={btnLogout}>
  🔙 Kthehu te Paneli i Administratorit
</button>

    </div>
  );
  
}

export default ProfessorManagement;
