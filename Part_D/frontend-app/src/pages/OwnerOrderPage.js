import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const ownerId = localStorage.getItem('user_id');

  // Loading all suppliers when the page loads.
  useEffect(() => {
    axios.get('http://localhost:8000/suppliers', {
      params: { user_id: ownerId }
    })
    .then(res => setSuppliers(res.data))
    .catch(err => console.error(err));
  }, [ownerId]);

  // Loading all products from a specific supplier.
  const handleSelect = (supplierId) => {
    setSelectedSupplier(supplierId);
    axios.get(`http://localhost:8000/suppliers/${supplierId}/products?user_id=${ownerId}`)
      .then(res => {
        setProducts(res.data);
        setQuantities({});
        setErrors({});
      })
      .catch(err => console.error(err));
  };

  // Saving the products and quantities that the grocer chooses.
  const handleQuantityChange = (productName, quantity) => {
    const product = products.find(p => p.product_name === productName);
    const num = parseInt(quantity);
    
    const newErrors = { ...errors };

    if (quantity === '') {
        delete newErrors[productName];
      } else if (isNaN(num) || num < 0) {
        newErrors[productName] = "כמות לא יכולה להיות מספר שלילי";
      } else if (num > 0 && num < product.min_quantity) {
        newErrors[productName] = `הכמות המינימלית היא ${product.min_quantity}`;
      } else {
        delete newErrors[productName];
      }
    

    setErrors(newErrors);
    setQuantities({ ...quantities, [productName]: quantity });
  };

  // Saving the order.
  const handleSubmit = async () => {
    try {
      const orderProducts = products
        .map(p => {
          const quantity = parseInt(quantities[p.product_name]);
          return {
            product_name: p.product_name,
            quantity,
            unit_price: p.price,
            total_price: quantity * p.price
          };
        })
        .filter(p => p.quantity > 0);
  
      if (orderProducts.length === 0) {
        setMessage("יש להזין לפחות מוצר אחד עם כמות גדולה מ-0");
        return;
      }
  
      const res = await axios.post('http://localhost:8000/orders', {
        supplier_id: selectedSupplier,
        products: orderProducts
      }, {
        params: { user_id: ownerId }
      });
  
      setMessage('ההזמנה נשלחה בהצלחה!');
      setQuantities({});
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage('שגיאה בשליחת ההזמנה');
    }
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ביצוע הזמנה</h2>
  
      <label style={styles.label}>בחר ספק:</label>
      <select
        value={selectedSupplier}
        onChange={(e) => handleSelect(e.target.value)}
        style={styles.select}
      >
        <option value="">-- בחר --</option>
        {suppliers.map((s) => (
          <option key={s.supplier_id} value={s.supplier_id}>
            {s.company_name}
          </option>
        ))}
      </select>
  
      {products.length > 0 && (
        <div style={styles.productsSection}>
          <h4 style={styles.subheading}>מוצרים להזמנה:</h4>
          {products.map((p, idx) => (
            <div key={idx} style={styles.productRow}>
              <span style={styles.productName}>
                {p.product_name} <span style={styles.price}>({`₪${p.price}`})</span>
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input
                  type="number"
                  min="0"
                  placeholder={`מינימום ${p.min_quantity}`}
                  value={quantities[p.product_name] || ''}
                  onChange={(e) => handleQuantityChange(p.product_name, e.target.value)}
                  style={styles.input}
                />
                {errors[p.product_name] && (
                  <div style={styles.error}>{errors[p.product_name]}</div>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            style={styles.button}
            disabled={Object.keys(errors).length > 0}
          >
            שלח הזמנה
          </button>
        </div>
      )}
  
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fdfdfd',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    direction: 'rtl',
    textAlign: 'right'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  select: {
    marginBottom: '20px',
    padding: 8,
    width: '100%',
    borderRadius: 6,
    border: '1px solid #ccc'
  },
  productsSection: {
    marginTop: 20
  },
  subheading: {
    fontSize: '18px',
    marginBottom: '10px'
  },
  productRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '8px'
  },
  productName: {
    fontWeight: 'bold'
  },
  price: {
    fontWeight: 'normal',
    color: '#666'
  },
  input: {
    width: '120px',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  error: {
    color: 'red',
    fontSize: '0.8em',
    marginTop: '4px'
  },
  button: {
    marginTop: 20,
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  message: {
    marginTop: '20px',
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '6px',
    textAlign: 'center'
  }
};


export default OwnerPage;
