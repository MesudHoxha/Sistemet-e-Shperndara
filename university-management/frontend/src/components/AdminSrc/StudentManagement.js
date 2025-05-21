import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function StudentManagement() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    faculty: '',
    department: '',
  });

  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    faculty: '',
    department: '',
  });

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('authTokens'))?.access;
    return { Authorization: `Bearer ${token}` };
  };
  
  useEffect(() => {
    loadAll();
  }, []);
  
  const loadAll = async () => {
    const [facRes, depRes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/v1/faculties/', { headers: getHeaders() }),
      axios.get('http://127.0.0.1:8000/api/v1/departments/', { headers: getHeaders() })
    ]);
  
    setFaculties(facRes.data);
    setDepartments(depRes.data);
  
    const stuRes = await axios.get('http://127.0.0.1:8000/api/v1/students/', { headers: getHeaders() });
  
    const enriched = stuRes.data.map(s => {
      const facultyObj = facRes.data.find(f => f.id === s.faculty);
      const departmentObj = depRes.data.find(d => d.id === s.department);
      return {
        ...s,
        faculty_name: facultyObj ? facultyObj.name : '---',
        department_name: departmentObj ? departmentObj.name : '---'
      };
    });
  
    setStudents(enriched);
  };
  
  

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/students/', {
        headers: getHeaders(),
      });

      const enriched = res.data.map((s) => {
        const facultyObj = faculties.find((f) => f.id === s.faculty);
        const departmentObj = departments.find((d) => d.id === s.department);
        return {
          ...s,
          faculty_name: facultyObj ? facultyObj.name : '---',
          department_name: departmentObj ? departmentObj.name : '---',
        };
      });

      setStudents(enriched);
    } catch (err) {
      console.error('❌ Gabim në marrjen e studentëve:', err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/faculties/', { headers: getHeaders() });
      setFaculties(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e fakulteteve:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/departments/', { headers: getHeaders() });
      setDepartments(res.data);
    } catch (err) {
      console.error('Gabim në marrjen e departamenteve:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('A dëshiron ta fshish këtë student?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/students/${id}/`, { headers: getHeaders() });
        fetchStudents();
      } catch (err) {
        console.error('Gabim gjatë fshirjes', err);
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    const filtered = departments.filter(d => d.faculty === student.faculty);
    setFilteredDepartments(filtered);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      faculty: student.faculty,
      department: student.department,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/students/${editingStudent.id}/`, {
        ...formData,
        first_name: formatName(formData.first_name),
        last_name: formatName(formData.last_name),
      }, { headers: getHeaders() });

      setEditingStudent(null);
      await loadAll(); // përditëso të dhënat me emra të përditësuar
    } catch (err) {
      console.error('Gabim në përditësim', err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/students/', {
        first_name: formatName(newStudent.first_name),
        last_name: formatName(newStudent.last_name),
        faculty: parseInt(newStudent.faculty),
        department: parseInt(newStudent.department)
      }, { headers: getHeaders() });

      setNewStudent({ first_name: '', last_name: '', faculty: '', department: '' });
      await fetchStudents();
      alert("✅ Studenti u shtua me sukses!");
    } catch (err) {
      console.error('❌ Gabim në shtimin e studentit:', err);
      alert("❌ Dështoi shtimi i studentit.");
    }
  };

  const handleFacultyChange = (e) => {
    const facultyId = parseInt(e.target.value);
    const filtered = departments.filter(dep => dep.faculty === facultyId);
    setFilteredDepartments(filtered);
    setNewStudent({ ...newStudent, faculty: facultyId, department: '' });
  };

  const handleEditFacultyChange = (e) => {
    const selectedFaculty = parseInt(e.target.value);
    const deps = departments.filter(d => d.faculty === selectedFaculty);
    setFilteredDepartments(deps);
    setFormData({ ...formData, faculty: selectedFaculty, department: '' });
  };

  const formatName = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const filteredStudents = students.filter(s =>
    [s.first_name, s.last_name, s.email, s.faculty_name, s.department_name, s.registration_date]
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const inputStyle = {
    display: 'block', marginBottom: '12px', padding: '8px 12px',
    width: '300px', borderRadius: '5px', border: '1px solid #ccc',
  };
  const btnPrimary = { padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  const btnSecondary = { ...btnPrimary, backgroundColor: '#6c757d' };
  const btnLogout = { marginTop: '30px', padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 8px rgba(0,0,0,0.05)', marginTop: '30px' };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' }}>
      <h2>🎓 Paneli i Administratorit</h2>
      <h3>👨‍🎓 Studentët</h3>

      <input
        type="text"
        placeholder="🔍 Filtro studentët..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, width: '320px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e1e7ef', textAlign: 'left' }}>
            {['ID', 'Emri', 'Mbiemri', 'Email', 'Fakulteti', 'Departamenti', 'Data Regjistrimit', 'Veprime'].map((h, i) => (
              <th key={i} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{s.id}</td>
              <td style={{ padding: '10px' }}>{s.first_name}</td>
              <td style={{ padding: '10px' }}>{s.last_name}</td>
              <td style={{ padding: '10px' }}>{s.email}</td>
              <td style={{ padding: '10px' }}>{s.faculty_name}</td>
              <td style={{ padding: '10px' }}>{s.department_name}</td>
              <td style={{ padding: '10px' }}>{s.registration_date ? format(new Date(s.registration_date), 'dd MMMM yyyy', { locale: enGB }) : ''}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEdit(s)}>✏️</button>
                <button onClick={() => handleDelete(s.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingStudent && (
        <div style={cardStyle}>
          <h4>✏️ Ndrysho Studentin</h4>
          <input placeholder="Emri" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={inputStyle} />
          <input placeholder="Mbiemri" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={inputStyle} />
          <input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
          <select value={formData.faculty} onChange={handleEditFacultyChange} style={inputStyle}>
            <option value="">Zgjidh Fakultetin</option>
            {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={inputStyle}>
            <option value="">Zgjidh Departamentin</option>
            {filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button onClick={handleUpdate} style={btnPrimary}>💾 Ruaj</button>
          <button onClick={() => setEditingStudent(null)} style={{ ...btnSecondary, marginLeft: '10px' }}>Anulo</button>
        </div>
      )}

      <div style={cardStyle}>
        <h4>➕ Shto Student të Ri</h4>
        <input placeholder="Emri" value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} style={inputStyle} />
        <input placeholder="Mbiemri" value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} style={inputStyle} />
        <select value={newStudent.faculty} onChange={handleFacultyChange} style={inputStyle}>
          <option value="">Zgjidh Fakultetin</option>
          {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={newStudent.department} onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })} style={inputStyle}>
          <option value="">Zgjidh Departamentin</option>
          {filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={handleCreate} style={btnPrimary}>📥 Shto Student</button>
      </div>

      <button onClick={() => navigate('/admin')} style={btnLogout}>🔙 Kthehu te Paneli i Administratorit</button>
    </div>
  );
}

export default StudentManagement;
