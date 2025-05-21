import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScholarshipApproval = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  const getHeaders = () => ({
    Authorization: `Bearer ${authTokens.access}`
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/scholarship-applications/', {
        headers: getHeaders()
      });
  
      // Filtrimi për aplikime që nuk janë as pranuar e as refuzuar (neutrale)
      const filtered = res.data.filter(app => app.is_approved === null || app.is_approved === undefined);
  
      // Marrim notën mesatare për secilin student
      const updated = await Promise.all(filtered.map(async (app) => {
        const studentId = app.student_id;
        try {
          const gradeRes = await axios.get(`http://127.0.0.1:8000/api/v1/students/${studentId}/average-grade/`, {
            headers: getHeaders()
          });
          return { ...app, average_grade: gradeRes.data.average_grade };
        } catch (err) {
          console.error("❌ Gabim në mesataren:", err);
          return { ...app, average_grade: null };
        }
      }));
  
      // Renditja nga më e larta te më e ulëta
      const sorted = updated.sort((a, b) => (b.average_grade || 0) - (a.average_grade || 0));
  
      setApplications(sorted);
    } catch (err) {
      console.error('❌ Gabim në marrjen e aplikimeve:', err);
    }
  };
  

  const approveScholarship = async (application) => {
    try {
      // Gjej shumën për muajin përkatës nga hapjet
      const res = await axios.get('http://127.0.0.1:8000/api/v1/scholarship-openings/', {
        headers: getHeaders()
      });
  
      const opening = res.data.find(open => open.month === application.month);
      const amount = opening?.amount || 0;
  
      await axios.post('http://127.0.0.1:8000/api/v1/scholarships/', {
        student: application.student,
        scholarship_type: application.month,  // kjo vendoset si lloj burse
        amount: amount,
        awarded_date: new Date().toISOString().split('T')[0]
      }, {
        headers: getHeaders()
      });
  
      await axios.patch(`http://127.0.0.1:8000/api/v1/scholarship-applications/${application.id}/`, {
        is_approved: true
      }, {
        headers: getHeaders()
      });
  
      fetchApplications();
    } catch (err) {
      console.error('❌ Gabim në aprovimin e bursës:', err);
    }
  };
  
  const rejectScholarship = async (application) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/scholarship-applications/${application.id}/`, {
        is_approved: false
      }, {
        headers: getHeaders()
      });
  
      fetchApplications();
    } catch (err) {
      console.error('❌ Gabim në refuzimin e bursës:', err);
    }
  };
  
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🎓 Aplikimet për Bursë</h2>

      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            <th style={thStyle}>Emri i studentit</th>
            <th style={thStyle}>Muaji</th>
            <th style={thStyle}>Data e aplikimit</th>
            <th style={thStyle}>Nota Mesatare</th>
            <th style={thStyle}>Veprime</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr key={app.id} style={i % 2 === 0 ? {} : rowAltStyle}>
              <td style={tdStyle}>{app.student_name}</td>
              <td style={tdStyle}>{app.month}</td>
              <td style={tdStyle}>{app.applied_date}</td>
              <td style={{
                ...tdStyle,
                color: app.average_grade >= 8 ? 'green' : 'red',
                fontWeight: 'bold'
              }}>
                {app.average_grade !== null ? app.average_grade.toFixed(2) : 'N/A'}
              </td>
              <td style={tdStyle}>
  <button
    onClick={() => approveScholarship(app)}
    style={approveButtonStyle}
  >
    ✅ Prano
  </button>
  <button
    onClick={() => rejectScholarship(app)}
    style={rejectButtonStyle}
  >
    ❌ Refuzo
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => navigate(-1)} style={btnBack}>🔙 Kthehu</button>
    </div>
  );
};

const containerStyle = {
  padding: '40px',
  maxWidth: '1000px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  fontFamily: 'Arial, sans-serif',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '25px',
  color: '#212529',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white'
};

const theadRowStyle = {
  background: '#e1e7ef',
  textAlign: 'left'
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #dee2e6'
};

const rowAltStyle = {
  backgroundColor: '#f8f9fa'
};

const approveButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
};

const btnBack = {
  marginTop: '40px',
  padding: '10px 20px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
const rejectButtonStyle = {
  padding: '8px 12px',
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  marginLeft: '10px'
};

export default ScholarshipApproval;
