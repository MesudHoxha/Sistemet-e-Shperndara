import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ChangePasswordForm = () => {
  const { authTokens } = useContext(AuthContext);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/change-password/', form, {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      });
      setMessage(res.data.detail);
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.detail || '❌ Ndodhi një gabim.');
    }
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} style={triggerButtonStyle}>🔒 Ndrysho Fjalëkalimin</button>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <span onClick={() => setShowModal(false)} style={closeButton}>✖</span>
            <h3 style={{ marginBottom: '15px', color: '#212529' }}>🔑 Ndrysho Fjalëkalimin</h3>
            <input name="old_password" type="password" placeholder="Fjalëkalimi i vjetër" value={form.old_password} onChange={handleChange} style={inputStyle} />
            <input name="new_password" type="password" placeholder="Fjalëkalimi i ri" value={form.new_password} onChange={handleChange} style={inputStyle} />
            <input name="confirm_password" type="password" placeholder="Konfirmo fjalëkalimin" value={form.confirm_password} onChange={handleChange} style={inputStyle} />
            <button onClick={handleSubmit} style={buttonStyle}>📤 Ndrysho</button>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const triggerButtonStyle = {
  padding: '10px 18px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '20px'
};

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalBox = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  position: 'relative'
};

const closeButton = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold'
};

const inputStyle = {
  width: '90%',
  padding: '10px 12px',
  marginBottom: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '15px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

export default ChangePasswordForm;
