import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentAttendanceSection = () => {
  const { authTokens } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/attendances/', {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      setError('❌ Gabim gjatë ngarkimit të vijueshmërisë.');
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
      <h3 style={styles.title}>📊 Vijueshmëria</h3>

      {error && <p style={styles.error}>{error}</p>}

      {attendance.length === 0 ? (
        <p style={styles.empty}>Ende nuk është regjistruar vijueshmëri për ju.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Lënda</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Statusi</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td style={styles.td}>{a.subject_name || `ID: ${a.subject}`}</td>
                <td style={styles.td}>{a.date}</td>
                <td style={styles.td}>{a.status === 'present' ? '✅ Prezent' : '❌ Mungesë'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentAttendanceSection;
