import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function SubmissionsSection() {
  const { authTokens } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubject === '') {
      setFiltered(submissions);
    } else {
      const filteredData = submissions.filter(
        (s) => s.subject === parseInt(selectedSubject)
      );
      setFiltered(filteredData);
    }
  }, [selectedSubject, submissions]);

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  const fetchData = async () => {
    try {
      const [submissionRes, subjectRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/exam-submissions/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers }),
      ]);
      setSubmissions(submissionRes.data);
      setFiltered(submissionRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      console.error(err);
      setError('Gabim gjatë ngarkimit të paraqitjeve.');
    }
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '22px', marginBottom: '20px' },
    select: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '20px', minWidth: '220px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📋 Studentët që kanë paraqitur provimet</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label><strong>Zgjidh lëndën:</strong></label><br />
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        style={styles.select}
      >
        <option value="">Të gjitha</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <p>Asnjë student nuk e ka paraqitur ende ndonjë lëndë.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Studenti</th>
              <th style={styles.th}>Lënda</th>
              <th style={styles.th}>Data e Paraqitjes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={sub.id}>
                <td style={styles.td}>{sub.student_name}</td>
                <td style={styles.td}>{sub.subject_name}</td>
                <td style={styles.td}>{new Date(sub.submitted_at).toLocaleString('sq-AL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SubmissionsSection;
