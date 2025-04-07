import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OwnerAllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const ownerId = localStorage.getItem('user_id');

  // Loading all orders as soon as the page loads.
  useEffect(() => {
    axios.get('http://localhost:8000/orders', {
      params: { user_id: ownerId, status: "הושלמה" }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error(err));
  }, [ownerId]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>מאגר ההזמנות</h2>

      {orders.length === 0 ? (
        <p style={styles.empty}>אין הזמנות להצגה</p>
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
  }
};

export default OwnerAllOrdersPage;
