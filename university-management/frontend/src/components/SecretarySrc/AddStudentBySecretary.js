import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AddStudentBySecretary = () => {
  const { authTokens, user } = useContext(AuthContext);
  const [facultyId, setFacultyId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/secretaries/", {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
        const secretary = res.data.find(s => s.email === user.email);
        if (secretary) {
          setFacultyId(secretary.faculty);
        }
      } catch (err) {
        console.error("❌ Gabim në marrjen e sekretarit:", err);
      }
    };

    if (user?.role === 'secretary') fetchFaculty();
  }, [authTokens, user]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/departments/", {
          headers: { Authorization: `Bearer ${authTokens.access}` }
        });
        const filtered = res.data.filter(dep => dep.faculty === facultyId);
        setDepartments(filtered);
      } catch (err) {
        console.error("❌ Gabim në marrjen e departamenteve:", err);
      }
    };

    if (facultyId) fetchDepartments();
  }, [facultyId, authTokens]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/students/", {
        ...formData,
        faculty: facultyId
      }, {
        headers: { Authorization: `Bearer ${authTokens.access}` }
      });

      setSuccessMessage('🎉 Studenti u shtua me sukses!');
      setFormData({ first_name: '', last_name: '', department: '' });
    } catch (err) {
      console.error("❌ Gabim në shtimin e studentit:", err);
    }
  };

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '500px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      marginBottom: '25px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#212529',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '16px',
    },
    button: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    success: {
      color: 'green',
      marginTop: '15px',
      textAlign: 'center',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>➕ Shto Student të Ri</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="Emri"
          value={formData.first_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Mbiemri"
          value={formData.last_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Zgjidh departamentin</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>

        <button type="submit" style={styles.button}>📥 Shto Student</button>
      </form>

      {successMessage && <p style={styles.success}>{successMessage}</p>}
    </div>
  );
};

export default AddStudentBySecretary;
