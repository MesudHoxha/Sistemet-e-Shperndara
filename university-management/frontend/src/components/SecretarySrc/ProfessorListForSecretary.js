import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ProfessorListForSecretary = () => {
  const { authTokens, user } = useContext(AuthContext);
  const [facultyId, setFacultyId] = useState(null);
  const [professors, setProfessors] = useState([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/secretaries/", {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        });
        const secretary = res.data.find(s => s.email === user.email);
        if (secretary) setFacultyId(secretary.faculty);
      } catch (err) {
        console.error("❌ Gabim në marrjen e sekretarit:", err);
      }
    };

    if (user?.role === 'secretary') fetchFaculty();
  }, [authTokens, user]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/v1/professors/", {
          headers: { Authorization: `Bearer ${authTokens.access}` },
        });
        const filtered = res.data.filter(p => p.faculty === facultyId);
        setProfessors(filtered);
      } catch (err) {
        console.error("❌ Gabim në marrjen e profesorëve:", err);
      }
    };

    if (facultyId) fetchProfessors();
  }, [facultyId, authTokens]);

  // 🎨 Stilet
  const styles = {
    container: {
      padding: '40px',
      maxWidth: '1000px',
      margin: '40px auto',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '25px',
      color: '#212529',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px',
      textAlign: 'left',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6',
    },
    rowAlt: {
      backgroundColor: '#f8f9fa',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👨‍🏫 Profesorët e Fakultetit Tim</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Emri</th>
            <th style={styles.th}>Mbiemri</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Data punësimit</th>
          </tr>
        </thead>
        <tbody>
          {professors.map((prof, index) => (
            <tr
              key={prof.id}
              style={index % 2 === 0 ? {} : styles.rowAlt}
            >
              <td style={styles.td}>{prof.id}</td>
              <td style={styles.td}>{prof.first_name}</td>
              <td style={styles.td}>{prof.last_name}</td>
              <td style={styles.td}>{prof.email}</td>
              <td style={styles.td}>{prof.hire_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfessorListForSecretary;
