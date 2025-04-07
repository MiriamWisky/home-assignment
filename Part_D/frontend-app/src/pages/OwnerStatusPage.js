import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OwnerStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const ownerId = localStorage.getItem('user_id');

  // Loading existing orders.
  useEffect(() => {
    fetchOrders();
  }, [ownerId]);

  const fetchOrders = () => {
    axios.get('http://localhost:8000/orders', {
      params: { user_id: ownerId, status: "בתהליך" }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error(err));
  };

  // Marking an order as "הושלמה".
  const markAsComplete = async (orderId) => {
    try {
      await axios.put(`http://localhost:8000/orders/${orderId}/complete`, null, {
        params: { user_id: ownerId }
      });
      setMessage("ההזמנה סומנה כהושלמה");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setMessage("שגיאה בסימון ההזמנה כהושלמה");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>סטטוס הזמנות פעילות</h2>
      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}

      {orders.length === 0 ? (
        <p style={styles.empty}>אין הזמנות פעילות להצגה</p>
      ) : (
        <ul style={styles.list}>
          {orders.map((order) => (
            <li key={order._id} style={styles.card}>
              <div style={styles.row}>
                <strong>סטטוס:</strong> <span>{order.status}</span>
              </div>
              <div style={styles.row}>
                <strong>תאריך:</strong> <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div style={styles.row}>
                <strong>מוצרים:</strong>
              </div>
              <ul style={styles.productsList}>
                {order.products.map((p, idx) => (
                  <li key={idx} style={styles.productItem}>
                    {p.product_name} - {p.quantity} יח' (₪{p.unit_price})
                  </li>
                ))}
              </ul>

              {order.status === "בתהליך" && (
                <button
                  onClick={() => markAsComplete(order._id)}
                  style={styles.button}
                >
                  סמן כהושלמה
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '700px',
    margin: '0 auto',
    direction: 'rtl',
    textAlign: 'right'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  empty: {
    textAlign: 'center',
    color: '#777'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.05)'
  },
  row: {
    marginBottom: '10px'
  },
  productsList: {
    listStyle: 'disc',
    paddingRight: '20px',
    marginTop: '10px'
  },
  productItem: {
    marginBottom: '5px'
  },
  button: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default OwnerStatusPage;
