import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [authTokens, setAuthTokens] = useState(() => {
    const stored = localStorage.getItem('authTokens');
    return stored ? JSON.parse(stored) : null;
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authTokens');
      return stored ? jwtDecode(JSON.parse(stored).access) : null;
    } catch (err) {
      return null;
    }
  });
  const fetchUserProfile = async (accessToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/user-profile/', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ⬅️ kjo është thelbësore
          'Content-Type': 'application/json',
        },
      });
    const data = await res.json();
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  } catch (err) {
    console.error('Gabim në ngarkimin e profilit:', err);
  }
};
  
  
  const login = (accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const authData = { access: accessToken };
  
      setAuthTokens(authData);
      fetchUserProfile(accessToken); // ✅ kjo është thelbësore!
      localStorage.setItem('authTokens', JSON.stringify(authData));
    } catch (err) {
      console.error("Gabim në dekodimin e tokenit:", err);
    }
  };
  

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login');
  };

  // ✅ Kur rifreskohet faqja, vendos user-in në bazë të tokenit
  useEffect(() => {
    if (!user && authTokens) {
      fetchUserProfile(authTokens.access);
    }
  }, [authTokens]);
  

  // ✅ Navigim automatik sapo vendoset roli
  useEffect(() => {
    if (user && (window.location.pathname === '/login' || window.location.pathname === '/')) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'professor') navigate('/professor');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'secretary') navigate('/secretary'); 
      else if (user.role === 'finance') navigate('/finance'); 
      else if (user.role === 'exam') navigate('/exam');
      else if (user.role === 'librarian') navigate('/librarian'); 
    }
  }, [user, navigate]);
  
  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('authTokens'));
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (tokens) {
      setAuthTokens(tokens);
      setUser(savedUser); // ruaje userin që ishte
    }
  }, []);
  

  const contextData = {
    user,
    authTokens,
    login,
    logout,
    isAuthenticated: !!authTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};
