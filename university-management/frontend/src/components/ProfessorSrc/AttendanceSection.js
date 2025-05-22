import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AttendanceSection = () => {
  const { authTokens } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [allAttendances, setAllAttendances] = useState([]);
  const [scheduleDays, setScheduleDays] = useState([]);
  const [form, setForm] = useState({ subject: '' });

  const headers = { Authorization: `Bearer ${authTokens?.access}` };
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const dayMap = {
    Monday: 'E Hënë',
    Tuesday: 'E Martë',
    Wednesday: 'E Mërkurë',
    Thursday: 'E Enjte',
    Friday: 'E Premte',
    Saturday: 'E Shtunë',
    Sunday: 'E Diel'
  };
  const todayNameEnglish = today.toLocaleString('en-US', { weekday: 'long' });
  const todayName = dayMap[todayNameEnglish]; // tani përputhet me orarin në shqip
  

  useEffect(() => {
    fetchSubjects();
    fetchAllAttendances();
  }, []);

  useEffect(() => {
    if (form.subject) {
      fetchAttendanceList();
      fetchScheduleDays();
    }
  }, [form.subject]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/subjects/', { headers });
      setSubjects(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e lëndëve", err);
    }
  };

  const fetchScheduleDays = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/schedules/', { headers });
      const filtered = res.data.filter(s => s.subject === parseInt(form.subject));
      setScheduleDays(filtered.map(s => s.day_of_week));
    } catch (err) {
      console.error("❌ Gabim në marrjen e orarit", err);
    }
  };

  const fetchStudents = async () => {
    try {
      if (!scheduleDays.includes(todayName)) {
        alert(`⛔ Sot nuk ka orar për këtë lëndë (${todayName}).`);
        return;
      }

      const res = await axios.get('http://127.0.0.1:8000/api/v1/exam-submissions/', { headers });
      const filtered = res.data.filter(s => s.subject === parseInt(form.subject));
      setStudents(filtered);
      setAttendance(filtered.map(s => ({ student: s.student, status: 'present' })));
    } catch (err) {
      console.error("❌ Gabim në marrjen e studentëve", err);
    }
  };

  const fetchAttendanceList = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/attendances/', {
        headers,
        params: { subject: form.subject, date: todayDate }
      });
      setAttendanceList(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e prezencës për sot", err);
    }
  };

  const fetchAllAttendances = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/attendances/', { headers });
      setAllAttendances(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e të gjitha prezencave", err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev =>
      prev.map(a =>
        a.student === studentId ? { ...a, status } : a
      )
    );
  };

  const handleSubmit = async () => {
    try {
      for (const entry of attendance) {
        const exists = attendanceList.find(a => a.student === entry.student);
        if (exists) continue;

        await axios.post('http://127.0.0.1:8000/api/v1/attendances/', {
          student: entry.student,
          subject: form.subject,
          date: todayDate,
          status: entry.status
        }, { headers });
      }
      alert("✅ Vijueshmëria u regjistrua me sukses!");
      fetchAttendanceList();
      fetchAllAttendances();
    } catch (err) {
      console.error("❌ Gabim gjatë regjistrimit", err);
      alert("Gabim gjatë regjistrimit të vijueshmërisë.");
    }
  };

  const handleEdit = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/attendances/${id}/`, { status }, { headers });
      fetchAttendanceList();
      fetchAllAttendances();
    } catch (err) {
      console.error("❌ Gabim në përditësim", err);
    }
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '22px', marginBottom: '20px' },
    label: { display: 'block', margin: '10px 0 5px' },
    select: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px' },
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', marginTop: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#007bff', color: '#fff', padding: '10px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #ccc' }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Regjistro Vijueshmërinë</h3>
      <p><strong>Data aktuale:</strong> {todayDate} ({todayName})</p>

      <label style={styles.label}>Lënda:</label>
      <select
        style={styles.select}
        value={form.subject}
        onChange={e => setForm({ ...form, subject: e.target.value })}
      >
        <option value="">Zgjedh lëndën</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <br />
      <button onClick={fetchStudents} style={styles.button}>📥 Gjej Studentët për Prezencë</button>

      {students.length > 0 && (
        <>
          <h4 style={{ marginTop: '30px' }}>✅ Shëno prezencën</h4>
          {students.map(s => (
            <div key={s.student}>
              {s.student_name} — 
              <select
                style={styles.select}
                onChange={e => handleStatusChange(s.student, e.target.value)}
              >
                <option value="present">Prezent</option>
                <option value="absent">Mungesë</option>
              </select>
            </div>
          ))}
          <button onClick={handleSubmit} style={styles.button}>📤 Regjistro Prezencën</button>
        </>
      )}

      <h4 style={{ marginTop: '40px' }}>📋 Prezenca për datën {todayDate}</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Studenti</th>
            <th style={styles.th}>Statusi</th>
            <th style={styles.th}>Ndrysho</th>
          </tr>
        </thead>
        <tbody>
          {attendanceList.map((a) => (
            <tr key={a.id}>
              <td style={styles.td}>{a.student_name}</td>
              <td style={styles.td}>{a.status}</td>
              <td style={styles.td}>
                <select
                  style={styles.select}
                  value={a.status}
                  onChange={e => handleEdit(a.id, e.target.value)}
                >
                  <option value="present">Prezent</option>
                  <option value="absent">Mungesë</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: '60px' }}>🗂️ Të gjitha prezencat e regjistruara</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Studenti</th>
            <th style={styles.th}>Lënda</th>
            <th style={styles.th}>Data</th>
            <th style={styles.th}>Statusi</th>
          </tr>
        </thead>
        <tbody>
          {allAttendances.map(a => (
            <tr key={a.id}>
              <td style={styles.td}>{a.student_name}</td>
              <td style={styles.td}>{a.subject_name}</td>
              <td style={styles.td}>{a.date}</td>
              <td style={styles.td}>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceSection;
