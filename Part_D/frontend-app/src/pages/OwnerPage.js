import React from 'react';
import { useNavigate } from 'react-router-dom';

// The grocery store owner's main page.
const OwnerPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>שלום</h1>
      <h2 style={styles.subtitle}>בחר פעולה שברצונך לבצע</h2>
    <br></br>
      <div style={styles.buttonGroup}>
        <button onClick={() => navigate('/owner/order')} style={styles.button}>
          הזמנת סחורה מספק
        </button>
        <br></br>
        <button onClick={() => navigate('/owner/status')} style={styles.button}>
          צפייה בסטטוס הזמנות קיימות
        </button>
        <br></br>
        <button onClick={() => navigate('/owner/all-orders')} style={styles.button}>
          מאגר כל ההזמנות
        </button>
        <br></br>
        <button onClick={() => navigate('/owner/inventory')} style={styles.button}>
          ניהול סחורות
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    textAlign: 'center'
  },
  title: {
    marginBottom: '10px'
  },
  subtitle: {
    marginBottom: '30px',
    fontSize: '1.1em',
    color: '#555'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center'
  },
  button: {
    padding: '12px 20px',
    fontSize: '18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    width: '280px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  }
};

export default OwnerPage;
