import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allProfessors, setAllProfessors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    faculty: '',
    department: '',
    subject: '',
    professor: '',
    exam_date: '',
    exam_time: '',
    room: ''
  });

  const headers = {
    Authorization: `Bearer ${authTokens?.access}`
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [examRes, subjectRes, profRes, roomRes, facultyRes, deptRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/exams/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/professors/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/rooms/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/faculties/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/departments/', { headers }),
      ]);

      setExams(examRes.data);
      setSubjects(subjectRes.data);
      setAllProfessors(profRes.data);
      setAllRooms(roomRes.data);
      setFaculties(facultyRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("❌ Gabim gjatë marrjes së të dhënave:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    const normalizeTime = (t) => t?.slice(0, 5); // "10:00:00" → "10:00"

    if (name === 'subject') {
      const selectedSubject = subjects.find(s => s.id === parseInt(value));
      const prof = allProfessors.find(p => p.id === selectedSubject?.professor);
      setFilteredProfessors(prof ? [prof] : []);
      setFormData(prev => ({ ...prev, professor: prof?.id || '' }));
    }

    if (name === 'faculty') {
      const selectedFaculty = parseInt(value);
      const availableRooms = allRooms.filter(r => r.faculty === selectedFaculty);
      const { exam_date, exam_time } = formData;

      const filtered = availableRooms.filter(room => {
        const conflict = exams.some(ex =>
          ex.exam_date === exam_date &&
          normalizeTime(ex.exam_time) === normalizeTime(exam_time) &&
          ex.room === room.room_number
        );
        return !conflict;
      });

      setFilteredRooms(filtered);
    }

    if (name === 'exam_date' || name === 'exam_time') {
      const selectedFaculty = parseInt(formData.faculty);
      const newExamDate = name === 'exam_date' ? value : formData.exam_date;
      const newExamTime = name === 'exam_time' ? value : formData.exam_time;

      const rooms = allRooms.filter(r => r.faculty === selectedFaculty);

      const filtered = rooms.filter(room => {
        const conflict = exams.some(ex =>
          ex.exam_date === newExamDate &&
          normalizeTime(ex.exam_time) === normalizeTime(newExamTime) &&
          ex.room === room.room_number
        );
        return !conflict;
      });

      setFilteredRooms(filtered);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        subject: formData.subject,
        professor: formData.professor,
        exam_date: formData.exam_date,
        exam_time: formData.exam_time,
        room: allRooms.find(r => r.id === parseInt(formData.room))?.room_number
      };

      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/v1/exams/${editingId}/`, payload, { headers });
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/exams/', payload, { headers });
      }

      setFormData({
        faculty: '',
        department: '',
        subject: '',
        professor: '',
        exam_date: '',
        exam_time: '',
        room: ''
      });
      setEditingId(null);
      fetchAllData();
    } catch (err) {
      console.error("❌ Gabim gjatë ruajtjes së provimit:", err);
    }
  };

  const handleEdit = (exam) => {
    setFormData({
      faculty: '',
      department: '',
      subject: exam.subject,
      professor: allProfessors.find(p => `${p.first_name} ${p.last_name}` === exam.professor_name)?.id || '',
      exam_date: exam.exam_date,
      exam_time: exam.exam_time,
      room: allRooms.find(r => r.room_number === exam.room)?.id || ''
    });
    setEditingId(exam.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("A je i sigurt që do ta fshish këtë provim?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/exams/${id}/`, { headers });
        fetchAllData();
      } catch (err) {
        console.error("❌ Gabim në fshirjen e provimit:", err);
      }
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>📘 Menaxho Provimet</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        <select name="faculty" value={formData.faculty} onChange={handleChange} style={inputStyle}>
          <option value="">Zgjedh Fakultetin</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select name="department" value={formData.department} onChange={handleChange} style={inputStyle}>
          <option value="">Zgjedh Departamentin</option>
          {departments.filter(d => d.faculty === parseInt(formData.faculty)).map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select name="subject" value={formData.subject} onChange={handleChange} style={inputStyle}>
          <option value="">Zgjedh Lëndën</option>
          {subjects.filter(s => s.department === parseInt(formData.department)).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select name="professor" value={formData.professor} onChange={handleChange} style={inputStyle}>
          <option value="">Zgjedh Profesorin</option>
          {filteredProfessors.map(p => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
        <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} style={inputStyle} />
        <input type="time" name="exam_time" value={formData.exam_time} onChange={handleChange} style={inputStyle} />
        <select name="room" value={formData.room} onChange={handleChange} style={inputStyle}>
          <option value="">Zgjedh Sallën</option>
          {filteredRooms.map(r => (
            <option key={r.id} value={r.id}>{r.room_number} - {r.building_name}</option>
          ))}
        </select>
        <button onClick={handleSubmit} style={btnPrimary}>
          {editingId ? "💾 Ruaj Ndryshimet" : "📤 Shto"}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e1e7ef', textAlign: 'left' }}>
            <th style={thStyle}>Fakulteti</th>
            <th style={thStyle}>Departamenti</th>
            <th style={thStyle}>Lënda</th>
            <th style={thStyle}>Profesori</th>
            <th style={thStyle}>Data</th>
            <th style={thStyle}>Ora</th>
            <th style={thStyle}>Salla</th>
            <th style={thStyle}>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {exams.map(exam => {
            const subject = subjects.find(s => s.id === exam.subject);
            const department = departments.find(d => d.id === subject?.department);
            const faculty = faculties.find(f => f.id === department?.faculty);
            return (
              <tr key={exam.id}>
                <td style={tdStyle}>{faculty?.name || '---'}</td>
                <td style={tdStyle}>{department?.name || '---'}</td>
                <td style={tdStyle}>{exam.subject_name}</td>
                <td style={tdStyle}>{exam.professor_name}</td>
                <td style={tdStyle}>{exam.exam_date}</td>
                <td style={tdStyle}>{exam.exam_time}</td>
                <td style={tdStyle}>{exam.room}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(exam)} style={{ marginRight: '5px' }}>✏️</button>
                  <button onClick={() => handleDelete(exam.id)}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={() => navigate(-1)} style={btnBack}>🔙 Kthehu</button>
    </div>
  );
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  minWidth: '180px'
};

const btnPrimary = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const btnBack = {
  marginTop: '40px',
  padding: '10px 20px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #dee2e6'
};

export default ExamManagement;
