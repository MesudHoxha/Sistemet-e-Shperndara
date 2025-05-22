import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubjectManagementBySecretary = () => {
  const { user, authTokens } = useContext(AuthContext);
  const [facultyId, setFacultyId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ name: '', department: '', professor: '', credits: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const secRes = await axios.get('http://127.0.0.1:8000/api/v1/secretaries/', { headers });
        const secretary = secRes.data.find(s => s.email === user.email);
        if (secretary) setFacultyId(secretary.faculty);

        const profRes = await axios.get('http://127.0.0.1:8000/api/v1/professors/', { headers });
        const filteredProfessors = profRes.data.filter(p => p.faculty === secretary.faculty);
        setProfessors(filteredProfessors);
        
      } catch (err) {
        console.error('❌ Gabim në marrjen e të dhënave fillestare:', err);
      }
    };
    fetchInitialData();
  }, [user, authTokens]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/departments/', { headers });
      const filtered = res.data.filter(d => d.faculty === facultyId);
      setDepartments(filtered);
    };

    const fetchSubjects = async () => {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers });
      setSubjects(res.data);
    };

    if (facultyId) {
      fetchDepartments();
      fetchSubjects();
    }
  }, [facultyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        department: formData.department,
        professor: formData.professor,
        credits: formData.credits
      };
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/v1/subjects/${editingId}/`, payload, { headers });
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/subjects/', payload, { headers });
      }
      setFormData({ name: '', department: '', professor: '', credits: '' });
      setEditingId(null);
      const updatedSubjects = await axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers });
      setSubjects(updatedSubjects.data);
    } catch (err) {
      console.error('❌ Gabim në ruajtjen e lëndës:', err);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      department: subject.department,
      professor: subject.professor,
      credits: subject.credits
    });
    setEditingId(subject.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('A dëshironi ta fshini këtë lëndë?')) {
      await axios.delete(`http://127.0.0.1:8000/api/v1/subjects/${id}/`, { headers });
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const styles = {
    container: { padding: '40px', maxWidth: '900px', margin: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: 'Arial' },
    title: { fontSize: '24px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' },
    form: { display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' },
    input: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' },
    button: { padding: '10px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    rowAlt: { backgroundColor: '#f9f9f9' },
    backBtn: { marginBottom: '20px', backgroundColor: '#6c757d' }
  };

  return (
    <div style={styles.container}>
      <button style={{ ...styles.button, ...styles.backBtn }} onClick={() => navigate('/secretary')}>🔙 Kthehu te Paneli</button>
      <h2 style={styles.title}>📘 Menaxho Lëndët për Departamentet e Fakultetit</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input type="text" placeholder="Emri i lëndës" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} required />
        <select name="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={styles.input} required>
          <option value="">Zgjidh departamentin</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select name="professor" value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })} style={styles.input} required>
          <option value="">Zgjidh profesorin</option>
          {professors.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        <input type="number" placeholder="Kreditet" name="credits" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} style={styles.input} required />
        <button type="submit" style={styles.button}>{editingId ? '💾 Përditëso' : '➕ Shto Lëndën'}</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Emri</th>
            <th style={styles.th}>Departamenti</th>
            <th style={styles.th}>Profesori</th>
            <th style={styles.th}>Kredite</th>
            <th style={styles.th}>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={s.id} style={i % 2 === 0 ? {} : styles.rowAlt}>
              <td style={styles.td}>{s.name}</td>
              <td style={styles.td}>{departments.find(d => d.id === s.department)?.name}</td>
              <td style={styles.td}>{professors.find(p => p.id === s.professor)?.first_name} {professors.find(p => p.id === s.professor)?.last_name}</td>
              <td style={styles.td}>{s.credits}</td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(s)}>✏️</button>
                <button onClick={() => handleDelete(s.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectManagementBySecretary;
