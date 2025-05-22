import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentGradesSection = () => {
  const { authTokens } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/mygrades/', {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setGrades(res.data);
    } catch (err) {
      console.error(err);
      setError('❌ Gabim gjatë ngarkimit të notave.');
    }
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '22px', marginBottom: '20px' },
    error: { color: 'red', marginBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' },
    empty: { fontStyle: 'italic', color: '#666' },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📝 Notat e Marrë</h3>
      {error && <p style={styles.error}>{error}</p>}

      {grades.length === 0 ? (
        <p style={styles.empty}>Ende nuk ka nota të regjistruara për ju.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Lënda</th>
              <th style={styles.th}>Nota</th>
              <th style={styles.th}>Data e Provimit</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id}>
                <td style={styles.td}>{g.exam_subject_name || `Provim ID: ${g.exam}`}</td>
                <td style={styles.td}>{g.score}</td>
                <td style={styles.td}>{g.exam_date || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentGradesSection;
