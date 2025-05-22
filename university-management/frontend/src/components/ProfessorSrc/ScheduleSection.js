import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ScheduleSection = () => {
  const { authTokens } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newEntry, setNewEntry] = useState({
    subject: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    start_date: '',
    end_date: ''
  });
  const [editEntryId, setEditEntryId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, subjectRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/schedules/', {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        }),
        axios.get('http://127.0.0.1:8000/api/v1/subjects/', {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        }),
      ]);
      setSchedule(scheduleRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      console.error("Gabim gjatë ngarkimit:", err);
    }
  };

  const handleAddSchedule = () => {
    axios.post('http://127.0.0.1:8000/api/v1/schedules/', newEntry, {
      headers: { Authorization: `Bearer ${authTokens.access}` },
    })
      .then(() => {
        alert("Orari u shtua me sukses!");
        setNewEntry({ subject: '', day_of_week: '', start_time: '', end_time: '', start_date: '', end_date: '' });
        fetchData();
      })
      .catch(err => {
        console.error("Gabim gjatë shtimit:", err);
        alert("Gabim gjatë shtimit të orarit!");
      });
  };

  const handleEdit = (entry) => {
    setEditEntryId(entry.id);
    setEditData({
      subject: entry.subject,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      start_date: entry.start_date || '',
      end_date: entry.end_date || ''
    });
  };

  const handleSaveEdit = () => {
    axios.put(`http://127.0.0.1:8000/api/v1/schedules/${editEntryId}/`, editData, {
      headers: { Authorization: `Bearer ${authTokens.access}` },
    })
      .then(() => {
        alert("Orari u përditësua me sukses!");
        setEditEntryId(null);
        setEditData({});
        fetchData();
      })
      .catch(err => {
        console.error("Gabim gjatë përditësimit:", err);
        alert("Gabim gjatë përditësimit të orarit!");
      });
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '22px', marginBottom: '20px' },
    label: { marginTop: '10px', display: 'block', fontWeight: 'bold' },
    select: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px', marginBottom: '10px' },
    input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px', marginBottom: '10px' },
    button: { padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '10px' },
    item: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🕘 Orari i Lëndëve</h3>

      {schedule.map(entry => (
        <div key={entry.id} style={styles.item}>
          {editEntryId === entry.id ? (
            <>
              <select value={editData.subject} onChange={e => setEditData({ ...editData, subject: e.target.value })} style={styles.select}>
                <option value="">Lënda</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select value={editData.day_of_week} onChange={e => setEditData({ ...editData, day_of_week: e.target.value })} style={styles.select}>
                {["E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <input type="time" value={editData.start_time} onChange={e => setEditData({ ...editData, start_time: e.target.value })} style={styles.input} />
              <input type="time" value={editData.end_time} onChange={e => setEditData({ ...editData, end_time: e.target.value })} style={styles.input} />
              <input type="date" value={editData.start_date} onChange={e => setEditData({ ...editData, start_date: e.target.value })} style={styles.input} />
              <input type="date" value={editData.end_date} onChange={e => setEditData({ ...editData, end_date: e.target.value })} style={styles.input} />
              <button onClick={handleSaveEdit} style={styles.button}>💾 Ruaj</button>
            </>
          ) : (
            <>
              📚 <strong>{entry.subject_name}</strong> — 📅 {entry.day_of_week}, ⏰ {entry.start_time} - {entry.end_time}
              {entry.start_date && ` 📆 nga ${entry.start_date}`} {entry.end_date && ` deri më ${entry.end_date}`}
              <br />
              <button onClick={() => handleEdit(entry)} style={styles.button}>✏️ Edito</button>
            </>
          )}
        </div>
      ))}

      <h4 style={{ marginTop: '30px' }}>➕ Shto Orar të Ri</h4>

      <label style={styles.label}>Lënda: </label>
      <select value={newEntry.subject} onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })} style={styles.select}>
        <option value="">Zgjedh</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label style={styles.label}>Dita e javës: </label>
      <select value={newEntry.day_of_week} onChange={e => setNewEntry({ ...newEntry, day_of_week: e.target.value })} style={styles.select}>
        <option value="">Zgjedh</option>
        {["E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte"].map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <label style={styles.label}>Ora Fillimit: </label>
      <input type="time" value={newEntry.start_time} onChange={e => setNewEntry({ ...newEntry, start_time: e.target.value })} style={styles.input} />

      <label style={styles.label}>Ora Përfundimit: </label>
      <input type="time" value={newEntry.end_time} onChange={e => setNewEntry({ ...newEntry, end_time: e.target.value })} style={styles.input} />

      <label style={styles.label}>Prej datës: </label>
      <input type="date" value={newEntry.start_date} onChange={e => setNewEntry({ ...newEntry, start_date: e.target.value })} style={styles.input} />

      <label style={styles.label}>Deri më datë: </label>
      <input type="date" value={newEntry.end_date} onChange={e => setNewEntry({ ...newEntry, end_date: e.target.value })} style={styles.input} />

      <br />
      <button onClick={handleAddSchedule} style={styles.button}>📥 Shto Orar</button>
    </div>
  );
};

export default ScheduleSection;
