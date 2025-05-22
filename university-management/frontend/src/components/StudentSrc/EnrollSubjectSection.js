import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EnrollSubjectSection = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubjectsAndEnrollments();
  }, []);

  const fetchSubjectsAndEnrollments = async () => {
    try {
      const [subjectRes, enrollmentRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        }),
        axios.get('http://127.0.0.1:8000/api/v1/enrollments/', {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        }),
      ]);

      setSubjects(subjectRes.data);
      setEnrollments(enrollmentRes.data);
    } catch (err) {
      console.error('❌ Gabim gjatë ngarkimit:', err);
      setMessage('❌ Gabim në ngarkim të lëndëve ose regjistrimeve.');
    }
  };

  const handleEnroll = async () => {
    if (!selectedSubject) return;

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/v1/enrollments/',
        { subject: selectedSubject },
        { headers: { Authorization: `Bearer ${authTokens.access}` } }
      );

      setMessage('✅ U regjistruat me sukses!');
      setSelectedSubject('');
      fetchSubjectsAndEnrollments();
    } catch (err) {
      console.log("Gabimi:", err.response?.data);
      setMessage('❌ Gabim: ' + JSON.stringify(err.response?.data));
    }
  };

  const enrolledSubjectIds = enrollments.map(e => e.subject);
  const notEnrolledSubjects = subjects.filter(s => !enrolledSubjectIds.includes(s.id));

  // Stilet njësoj si në StudentManagement
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
      <h3>📚 Regjistrohu në një Lëndë</h3>

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        style={inputStyle}
      >
        <option value="">Zgjedh një lëndë</option>
        {notEnrolledSubjects.map(subject => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      <button onClick={handleEnroll} style={btnPrimary}>📥 Regjistrohu</button>

      {message && (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <hr style={{ margin: '30px 0' }} />

      <div style={cardStyle}>
        <h4>📋 Lëndët ku je i regjistruar</h4>
        <ul style={{ paddingLeft: '20px' }}>
          {enrollments.map(e => {
            const subj = subjects.find(s => s.id === e.subject);
            return (
              <li key={e.id}>{subj ? subj.name : `Lënda ID ${e.subject}`}</li>
            );
          })}
        </ul>
      </div>

      <button onClick={() => navigate('/student')} style={btnLogout}>
        🔙 Kthehu te Paneli i Studentit
      </button>
    </div>
  );
};

export default EnrollSubjectSection;
