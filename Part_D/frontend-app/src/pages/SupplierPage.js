import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SupplierPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const supplierId = localStorage.getItem('user_id');

  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState('');

// Loading orders placed from a specific supplier.
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/supplier-orders/${supplierId}`);
      
      const orders = res.data;

      const grouped = {
        "בוצעה": [],
        "בתהליך": [],
        "הושלמה": []
      };

      orders.forEach(order => {
        if (grouped[order.status]) {
          grouped[order.status].push(order);
        }
      });

      for (const status in grouped) {
        grouped[status].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setOrders(grouped);
      setPendingCount(grouped["בוצעה"].length);
      setError('');
    } catch (err) {
      setError('שגיאה בעת שליפת ההזמנות');
      console.error(err);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, [supplierId]);
  
  // Moving an order from "בוצעה" status to "בתהליך" status.
  const approveOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:8000/orders/${orderId}/start`, null, {
        params: { supplier_id: supplierId }
      });
      setMessage('ההזמנה אושרה בהצלחה');
      setTimeout(() => setMessage(''), 3000);
      fetchOrders(); 
    } catch (err) {
      alert('שגיאה באישור ההזמנה');
      console.error(err);
    }
  };
  

  return (
    
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>הזמנות שהוזמנו ממך</h2>
        {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}
        {pendingCount > 0 && (
      <div style={styles.notification}>
        יש לך {pendingCount} הזמנות חדשות שממתינות לאישור!
      </div>
    )}
        {error ? (
        <p style={styles.error}>{error}</p>
      ) : Object.values(orders).flat().length === 0 ? (
        <p style={styles.empty}>אין הזמנות להצגה כרגע.</p>
      ) : (
        <div>
          {["בוצעה", "בתהליך", "הושלמה"].map((status) =>
            orders[status]?.length > 0 && (
              <div key={status} style={{ marginBottom: '30px' }}>
                <h3 style={styles.sectionTitle}>
                  {status === "בוצעה" && "הזמנות שממתינות לאישור"}
                  {status === "בתהליך" && "הזמנות שנמצאות בתהליך"}
                  {status === "הושלמה" && "הזמנות שהושלמו"}
                </h3>
                <ul style={styles.list}>
                  {orders[status].map((order) => (
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
                            {p.product_name} - {p.quantity} יח'
                          </li>
                        ))}
                      </ul>

                      {order.status === "בוצעה" && (
                        <button
                          style={styles.button}
                          onClick={() => approveOrder(order._id)}
                        >
                          אשר הזמנה
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}

        {}
      </div>
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
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  sectionTitle: {
    marginBottom: '10px',
    fontSize: '18px',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px'
  },
  notification: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    padding: '12px',
    borderRadius: '6px',
    color: '#856404',
    marginBottom: '20px',
    textAlign: 'center'
  },
  message: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center'
  }
    
};


export default SupplierPage;
