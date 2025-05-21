import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const LoginForm = () => {
  const { login } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email i pavlefshëm').required('Emaili kërkohet'),
      password: Yup.string().required('Fjalëkalimi kërkohet'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          login(data.access);
        } else {
          setErrors({ password: 'Email ose fjalëkalim i pasaktë' });
        }
      } catch (error) {
        console.error('Gabim gjatë lidhjes me serverin:', error);
        setErrors({ password: 'Gabim gjatë lidhjes me serverin' });
      }
      setSubmitting(false);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Mirësevjen në Universitetin Virtual</h2>
        <p style={styles.subtitle}>Ju lutem kyçuni me kredencialet tuaja</p>

        <form onSubmit={formik.handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Emaili:</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              style={styles.input}
            />
            {formik.touched.email && formik.errors.email && (
              <div style={styles.error}>{formik.errors.email}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Fjalëkalimi:</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              style={styles.input}
            />
            {formik.touched.password && formik.errors.password && (
              <div style={styles.error}>{formik.errors.password}</div>
            )}
          </div>

          <button type="submit" disabled={formik.isSubmitting} style={styles.button}>
            Kyçu
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f5f5f5',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '10px',
    fontSize: '24px',
    color: '#222',
  },
  subtitle: {
    marginBottom: '30px',
    fontSize: '14px',
    color: '#555',
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  error: {
    marginTop: '4px',
    color: 'red',
    fontSize: '12px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default LoginForm;
