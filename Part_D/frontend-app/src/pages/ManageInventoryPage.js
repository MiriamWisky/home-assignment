import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState('');
  const [minQuantities, setMinQuantities] = useState({});

// Bringing up the product list as soon as the page loads.
  useEffect(() => {
    axios.get('http://localhost:8000/inventory')
      .then(res => setInventory(res.data))
      .catch(err => console.error(err));
  }, []);

  // Updating the minimum quantity, after the user has changed it.
  const handleMinChange = (index, value) => {
    const newInventory = [...inventory];
    newInventory[index].min_quantity = value;
    setInventory(newInventory);
  };
// The minimum quantity is updated after saving the change.
  const handleSave = (product_name, min_quantity) => {
    const parsedValue = parseInt(min_quantity);
    if (isNaN(parsedValue) || parsedValue < 0) {
      setMessage(`כמות מינימלית לא יכולה להיות שלילית`);
      return;
    }
    axios.put(`http://localhost:8000/inventory/${product_name}`, {
      min_quantity: parseInt(min_quantity)
    })
      .then(() => {
        setMessage(`עודכן ערך מינימלי עבור ${product_name}`);
        setTimeout(() => setMessage(''), 3000);

        // Reset the field after saving.
        setInventory(prevInventory =>
          prevInventory.map(item =>
            item.product_name === product_name
              ? { ...item, min_quantity: '' }
              : item
          )
          );
      })
      .catch(err => {
        console.error(err);
        setMessage('שגיאה בעדכון');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center' }}>ניהול סחורות</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>שם המוצר</th>
            <th>כמות נוכחית</th>
            <th>כמות מינימלית נדרשת</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, idx) => (
            <tr key={item.product_name}>
              <td>{item.product_name}</td>
              <td>{item.current_quantity}</td>
              <td>
                <input
                  type="number"
                  value={item.min_quantity}
                  onChange={(e) => handleMinChange(idx, e.target.value)}
                  style={styles.input}
                />
              </td>
              <td>
                <button
                  onClick={() => handleSave(item.product_name, item.min_quantity)}
                  style={styles.button}
                >
                  שמירה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    direction: 'rtl',
    textAlign: 'right'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  input: {
    width: '60px',
    padding: '5px'
  },
  button: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ManageInventoryPage;
