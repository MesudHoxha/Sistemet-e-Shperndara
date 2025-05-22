import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ManageBuildingsAndRooms = () => {
  const { authTokens } = useContext(AuthContext);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildingName, setBuildingName] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);



  const headers = {
    Authorization: `Bearer ${authTokens.access}`
  };

  useEffect(() => {
    fetchBuildings();
    fetchRooms();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/buildings/', { headers });
      setBuildings(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e ndërtesave:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/rooms/', { headers });
      setRooms(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e dhomave:", err);
    }
  };


  

  const handleAddBuilding = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/buildings/', {
        name: buildingName,
        address: buildingAddress
      }, { headers });

      setBuildingName('');
      setBuildingAddress('');
      fetchBuildings();
    } catch (err) {
      console.error("❌ Gabim në shtimin e ndërtesës:", err);
    }
  };

  const handleAddRoom = async () => {
    if (!roomNumber || !selectedBuilding) return;

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/rooms/', {
        room_number: roomNumber,
        building: selectedBuilding
      }, { headers });

      setRoomNumber('');
      setSelectedBuilding('');
      fetchRooms();
    } catch (err) {
      console.error("❌ Gabim në shtimin e dhomës:", err);
    }
  };

  const handleDeleteBuilding = async (id) => {
    if (window.confirm("A jeni i sigurt që doni të fshini këtë ndërtesë?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/buildings/${id}/`, { headers });
        fetchBuildings();
      } catch (err) {
        console.error("❌ Gabim në fshirjen e ndërtesës:", err);
      }
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("A jeni i sigurt që doni të fshini këtë dhomë?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/rooms/${id}/`, { headers });
        fetchRooms();
      } catch (err) {
        console.error("❌ Gabim në fshirjen e dhomës:", err);
      }
    }
  };

  const handleUpdateBuilding = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/buildings/${editingBuilding.id}/`, {
        name: buildingName,
        address: buildingAddress
      }, { headers });

      setEditingBuilding(null);
      setBuildingName('');
      setBuildingAddress('');
      fetchBuildings();
    } catch (err) {
      console.error("❌ Gabim në përditësim:", err);
    }
  };

  const handleUpdateRoom = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/rooms/${editingRoom.id}/`, {
        room_number: roomNumber,
        building: selectedBuilding
      }, { headers });

      setEditingRoom(null);
      setRoomNumber('');
      setSelectedBuilding('');
      fetchRooms();
    } catch (err) {
      console.error("❌ Gabim në përditësim të dhomës:", err);
    }
  };

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    section: {
      marginBottom: '40px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#212529'
    },
    input: {
      padding: '10px',
      margin: '5px',
      width: '200px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    },
    select: {
      padding: '10px',
      margin: '5px',
      width: '220px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    },
    button: {
      padding: '10px 14px',
      margin: '5px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    cancelButton: {
      backgroundColor: '#6c757d'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      marginLeft: '8px'
    },
    list: {
      listStyle: 'none',
      paddingLeft: '0'
    },
    listItem: {
      padding: '10px',
      borderBottom: '1px solid #e9ecef'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h2 style={styles.title}>🏢 Menaxho Ndërtesat</h2>
        <input
          style={styles.input}
          placeholder="Emri i ndërtesës"
          value={buildingName}
          onChange={e => setBuildingName(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Adresa"
          value={buildingAddress}
          onChange={e => setBuildingAddress(e.target.value)}
        />
        {editingBuilding ? (
          <>
            <button style={styles.button} onClick={handleUpdateBuilding}>💾 Ruaj</button>
            <button style={{ ...styles.button, ...styles.cancelButton }} onClick={() => {
              setEditingBuilding(null);
              setBuildingName('');
              setBuildingAddress('');
            }}>Anulo</button>
          </>
        ) : (
          <button style={styles.button} onClick={handleAddBuilding}>➕ Shto Ndërtesë</button>
        )}

        <ul style={styles.list}>
          {buildings.map(b => (
            <li key={b.id} style={styles.listItem}>
              {b.name} – {b.address}
              <button style={styles.button} onClick={() => {
                setEditingBuilding(b);
                setBuildingName(b.name);
                setBuildingAddress(b.address);
              }}>✏️</button>
              <button style={{ ...styles.button, ...styles.deleteButton }} onClick={() => handleDeleteBuilding(b.id)}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.title}>🚪 Menaxho Dhomat</h2>
        <input
          style={styles.input}
          placeholder="Numri i dhomës"
          value={roomNumber}
          onChange={e => setRoomNumber(e.target.value)}
        />
        <select
          style={styles.select}
          value={selectedBuilding}
          onChange={e => setSelectedBuilding(e.target.value)}
        >
          <option value="">Zgjedh ndërtesën</option>
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        {editingRoom ? (
          <>
            <button style={styles.button} onClick={handleUpdateRoom}>💾 Ruaj</button>
            <button style={{ ...styles.button, ...styles.cancelButton }} onClick={() => {
              setEditingRoom(null);
              setRoomNumber('');
              setSelectedBuilding('');
            }}>Anulo</button>
          </>
        ) : (
          <button style={styles.button} onClick={handleAddRoom}>➕ Shto Dhomë</button>
        )}

        <ul style={styles.list}>
          {rooms.map(r => (
            <li key={r.id} style={styles.listItem}>
              Dhomë {r.room_number} – {r.building_name || r.building}
              <button style={styles.button} onClick={() => {
                setEditingRoom(r);
                setRoomNumber(r.room_number);
                setSelectedBuilding(r.building);
              }}>✏️</button>
              <button style={{ ...styles.button, ...styles.deleteButton }} onClick={() => handleDeleteRoom(r.id)}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageBuildingsAndRooms;
