import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', {
        username,
        password
      });

      const { user_id, role } = response.data;

      localStorage.setItem('user_id', user_id);
      localStorage.setItem('role', role);

      if (role === 'owner') {
        navigate('/owner');
      } else if (role === 'supplier') {
        navigate('/supplier');
      }

    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.heading}>התחברות</h2>

        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>התחבר</button>

        <p style={styles.text}>
          אין לך חשבון? <a href="/register">הרשמה</a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '300px',
    display: 'flex',
    flexDirection: 'column'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  text: {
    marginTop: '15px',
    fontSize: '0.9em',
    textAlign: 'center'
  }
};

export default LoginForm;
