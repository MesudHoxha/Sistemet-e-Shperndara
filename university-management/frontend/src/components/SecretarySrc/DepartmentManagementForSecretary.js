import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const DepartmentManagement = () => {
  const { authTokens, user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [facultyId, setFacultyId] = useState(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editedDeptName, setEditedDeptName] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/secretaries/", {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        });
        const current = res.data.find(s => s.email === user.email);
        if (current) setFacultyId(current.faculty);
      } catch (err) {
        console.error("❌ Gabim në marrjen e sekretarit:", err);
      }
    };

    if (user?.role === 'secretary') fetchFaculty();
  }, [user, authTokens]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/departments/", {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        });
        setDepartments(res.data.filter(dep => dep.faculty === facultyId));
      } catch (err) {
        console.error("❌ Gabim në marrjen e departamenteve:", err);
      }
    };

    if (facultyId) fetchDepartments();
  }, [facultyId, authTokens]);

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/departments/", {
        name: newDeptName,
        faculty: facultyId
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setNewDeptName('');
      const res = await axios.get("http://127.0.0.1:8000/api/v1/departments/", {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setDepartments(res.data.filter(dep => dep.faculty === facultyId));
    } catch (err) {
      console.error("❌ Gabim në shtimin e departamentit:", err);
    }
  };

  const handleEditDepartment = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/departments/${id}/`, {
        name: editedDeptName,
        faculty: facultyId
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setEditingDeptId(null);
      setEditedDeptName('');
      const res = await axios.get("http://127.0.0.1:8000/api/v1/departments/", {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setDepartments(res.data.filter(dep => dep.faculty === facultyId));
    } catch (err) {
      console.error("❌ Gabim në editimin e departamentit:", err);
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/departments/${id}/`, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });
      setDepartments(departments.filter(dep => dep.id !== id));
    } catch (err) {
      console.error("❌ Gabim në fshirjen e departamentit:", err);
    }
  };

  // 🔹 Stilet
  const styles = {
    container: {
      padding: '40px',
      maxWidth: '600px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#212529',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
    },
    button: {
      padding: '8px 14px',
      margin: '0 5px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    deleteBtn: {
      backgroundColor: '#dc3545',
    },
    section: {
      marginTop: '30px',
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
      padding: '8px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📘 Menaxhimi i Departamenteve</h2>

      {departments.map(dep => (
        <div key={dep.id} style={styles.listItem}>
          {editingDeptId === dep.id ? (
            <>
              <input
                value={editedDeptName}
                onChange={(e) => setEditedDeptName(e.target.value)}
                style={{ ...styles.input, marginBottom: 0 }}
              />
              <div>
                <button style={styles.button} onClick={() => handleEditDepartment(dep.id)}>💾</button>
                <button style={{ ...styles.button, ...styles.deleteBtn }} onClick={() => setEditingDeptId(null)}>✖</button>
              </div>
            </>
          ) : (
            <>
              <span>{dep.name}</span>
              <div>
                <button style={styles.button} onClick={() => {
                  setEditingDeptId(dep.id);
                  setEditedDeptName(dep.name);
                }}>✏️</button>
                <button style={{ ...styles.button, ...styles.deleteBtn }} onClick={() => handleDeleteDepartment(dep.id)}>🗑️</button>
              </div>
            </>
          )}
        </div>
      ))}

      <div style={styles.section}>
        <h3>Shto Departament të ri</h3>
        <input
          type="text"
          placeholder="Emri i departamentit"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button} onClick={handleAddDepartment}>➕ Shto</button>
      </div>
    </div>
  );
};

export default DepartmentManagement;
