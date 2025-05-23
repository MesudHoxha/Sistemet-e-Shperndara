import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LibraryCreateSection = () => {
  const { authTokens, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [facultyId, setFacultyId] = useState(null);
  const [name, setName] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [libraries, setLibraries] = useState([]);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  const headers = { Authorization: `Bearer ${authTokens.access}` };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const secRes = await axios.get('http://127.0.0.1:8000/api/v1/secretaries/', { headers });
      const secretary = secRes.data.find(s => s.email === user?.email);
      if (!secretary) return setMessage('❌ Nuk u gjet sekretari me këtë email.');
      setFacultyId(secretary.faculty);

      const buildingRes = await axios.get('http://127.0.0.1:8000/api/v1/buildings/', { headers });
      setBuildings(buildingRes.data);

      const buildingsMap = {};
      buildingRes.data.forEach(b => buildingsMap[b.id] = b.name);

      const libRes = await axios.get('http://127.0.0.1:8000/api/v1/libraries/', { headers });
      const filtered = libRes.data
        .filter(lib => lib.faculty === secretary.faculty)
        .map(lib => ({ ...lib, building_name: buildingsMap[lib.building] || '—' }));
      setLibraries(filtered);
    } catch (err) {
      console.error("Gabim:", err);
      setMessage("❌ Gabim në ngarkimin e të dhënave.");
    }
  };

  const handleCreateLibrary = async () => {
    if (!name || !selectedBuilding || !facultyId) return setMessage("❗ Plotësoni të gjitha fushat.");

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/libraries/', {
        name,
        building: selectedBuilding,
        faculty: facultyId
      }, { headers });

      setMessage("✅ Biblioteka u krijua me sukses.");
      setName('');
      setSelectedBuilding('');
      setEditing(null);
      fetchInitialData();
    } catch (err) {
      console.error("Gabim në krijim:", err);
      setMessage("❌ Gabim gjatë krijimit të bibliotekës.");
    }
  };

  const handleUpdateLibrary = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/libraries/${editing.id}/`, {
        name,
        building: selectedBuilding,
        faculty: facultyId
      }, { headers });

      setMessage("✅ Biblioteka u përditësua.");
      setName('');
      setSelectedBuilding('');
      setEditing(null);
      fetchInitialData();
    } catch (err) {
      console.error("Gabim në përditësim:", err);
      setMessage("❌ Gabim gjatë përditësimit.");
    }
  };

  const handleEditClick = (lib) => {
    setEditing(lib);
    setName(lib.name);
    setSelectedBuilding(lib.building.toString());
  };

  const styles = {
    container: { padding: '40px', fontFamily: 'Arial, sans-serif' },
    label: { display: 'block', marginTop: '10px' },
    input: { padding: '8px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' },
    select: { padding: '8px', width: '260px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { marginTop: '15px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px' },
    message: { marginTop: '15px', color: message.includes("✅") ? 'green' : 'red' },
    table: { marginTop: '30px', borderCollapse: 'collapse', width: '100%' },
    th: { backgroundColor: '#007bff', color: 'white', padding: '8px' },
    td: { border: '1px solid #ccc', padding: '8px' },
    backButton: { marginTop: '30px', backgroundColor: '#6c757d' }
  };

  return (
    <div style={styles.container}>
      <h3>🏛️ {editing ? 'Përditëso Bibliotekë' : 'Krijo Bibliotekë për Fakultetin'}</h3>

      <label style={styles.label}>Emri i Bibliotekës:</label>
      <input
        type="text"
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label style={styles.label}>Ndërtesa:</label>
      <select
        style={styles.select}
        value={selectedBuilding}
        onChange={(e) => setSelectedBuilding(e.target.value)}
      >
        <option value="">Zgjedh ndërtesën</option>
        {buildings.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <br />
      <button onClick={editing ? handleUpdateLibrary : handleCreateLibrary} style={styles.button}>
        {editing ? "💾 Përditëso" : "📥 Krijo Bibliotekën"}
      </button>

      {message && <p style={styles.message}>{message}</p>}



      <button onClick={() => navigate('/secretary')} style={{ ...styles.button, ...styles.backButton }}>
        🔙 Kthehu mbrapa
      </button>
    </div>
  );
};

export default LibraryCreateSection;
