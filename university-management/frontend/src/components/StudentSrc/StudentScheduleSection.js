import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const StudentScheduleSection = () => {
  const { authTokens } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const enrollmentRes = await axios.get('http://127.0.0.1:8000/api/v1/enrollments/', {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      const subjectIds = enrollmentRes.data.map(e => e.subject);

      const scheduleRes = await axios.get('http://127.0.0.1:8000/api/v1/schedules/', {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });

      const filteredSchedule = scheduleRes.data.filter(s => subjectIds.includes(s.subject));
      setSchedule(filteredSchedule);
    } catch (err) {
      console.error(err);
      setError('❌ Gabim gjatë ngarkimit të orarit.');
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
      <h3 style={styles.title}>🕘 Orari i Lëndëve</h3>
      {error && <p style={styles.error}>{error}</p>}

      {schedule.length === 0 ? (
        <p style={styles.empty}>Nuk ka orar për lëndët e regjistruara.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Lënda</th>
              <th style={styles.th}>Dita</th>
              <th style={styles.th}>Ora Fillimit</th>
              <th style={styles.th}>Ora Përfundimit</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s) => (
              <tr key={s.id}>
                <td style={styles.td}>{s.subject_name || `ID: ${s.subject}`}</td>
                <td style={styles.td}>{s.day_of_week}</td>
                <td style={styles.td}>{s.start_time}</td>
                <td style={styles.td}>{s.end_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentScheduleSection;
