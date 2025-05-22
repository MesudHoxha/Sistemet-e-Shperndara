import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ExamSubmissionSection = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentRes, submissionRes, subjectRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/enrollments/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/exam-submissions/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers }),
      ]);
      setEnrollments(enrollmentRes.data);
      setSubmissions(submissionRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      console.error('❌ Gabim në ngarkim:', err);
      setMessage('❌ Gabim gjatë ngarkimit të të dhënave.');
    }
  };

  const handleSubmitExam = async () => {
    if (!selectedSubject) return;

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/exam-submissions/', {
        subject: selectedSubject,
      }, { headers });

      setMessage('✅ Lënda u paraqit me sukses!');
      setSelectedSubject('');
      fetchData();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage('❌ Kjo lëndë është paraqitur tashmë ose ka ndodhur një gabim.');
    }
  };

  // Filtron lëndët ku nuk është bërë paraqitja
  const submittedSubjectIds = submissions.map(s => s.subject);
  const availableSubjects = enrollments.filter(e => !submittedSubjectIds.includes(e.subject));

  const getSubjectName = (subjectId) => {
    const subj = subjects.find(s => s.id === subjectId);
    return subj ? subj.name : `Lënda ID: ${subjectId}`;
  };

  // Stilet të njëjta si në StudentManagement
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
      <h2>🎓 Paneli i Studentit</h2>
      <h3>📤 Paraqit Lëndë për Provim</h3>

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        style={inputStyle}
      >
        <option value="">Zgjedh një lëndë</option>
        {availableSubjects.map(e => (
          <option key={e.id} value={e.subject}>
            {getSubjectName(e.subject)}
          </option>
        ))}
      </select>

      <button onClick={handleSubmitExam} style={btnPrimary}>📥 Paraqit</button>

      {message && (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <hr style={{ margin: '30px 0' }} />

      <div style={cardStyle}>
        <h4>📋 Lëndët që ke paraqitur</h4>
        <ul style={{ paddingLeft: '20px' }}>
          {submissions.map(s => (
            <li key={s.id}>{getSubjectName(s.subject)}</li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate('/student')} style={btnLogout}>
        🔙 Kthehu te Paneli i Studentit
      </button>
    </div>
  );
};

export default ExamSubmissionSection;
