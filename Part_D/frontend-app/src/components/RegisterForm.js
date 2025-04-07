import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    company_name: '',
    phone_number: '',
    representative_name: '',
  });

  const [products, setProducts] = useState([]);
  const [productInput, setProductInput] = useState({
    product_name: '',
    price: '',
    min_quantity: ''
  });

  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');


  const navigate = useNavigate();


  const validate = () => {
    const { username, password, company_name, phone_number, representative_name } = formData;

    if (username.length > 16) return "שם משתמש לא יכול להכיל יותר מ-16 תווים";
    if (password.length > 20) return "סיסמה לא יכולה להכיל יותר מ-20 תווים";
    if (!/^\d{7,12}$/.test(phone_number)) return "מספר טלפון חייב להכיל רק ספרות (7-12 ספרות)";
    if (company_name.length > 30) return "שם החברה ארוך מדי";
    if (representative_name.length > 25) return "שם הנציג ארוך מדי";
    if (products.length === 0) return "יש להוסיף לפחות מוצר אחד";
    return '';
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (e) => {
    setProductInput({ ...productInput, [e.target.name]: e.target.value });
  };

  const addProduct = () => {
    const { product_name, price, min_quantity } = productInput;

    if (!product_name || price === '' || min_quantity === '') {
      setErrors("כל שדות המוצר נדרשים");
      return;
    }

    if (product_name.length > 30) {
      setErrors("שם המוצר לא יכול להיות ארוך מ-30 תווים");
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      setErrors("המחיר חייב להיות מספר חיובי");
      return;
    }

    if (!Number.isInteger(Number(min_quantity)) || Number(min_quantity) <= 0) {
      setErrors("כמות מינימלית חייבת להיות מספר שלם חיובי");
      return;
    }

    setProducts([...products, {
      product_name,
      price: parseFloat(price),
      min_quantity: parseInt(min_quantity)
    }]);

    setProductInput({ product_name: '', price: '', min_quantity: '' });
    setErrors('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register-supplier', {
        ...formData,
        products,
      });
      setSuccess("ההרשמה בוצעה בהצלחה!");
      setErrors('');
      navigate('/supplier');
    } catch (err) {
      const detail = err.response?.data?.detail;
    
      if (detail === "Username already taken") {
        setErrors("שם המשתמש תפוס.");
      } else if (detail === "Phone number already registered") {
        setErrors("מספר הטלפון כבר קיים במערכת.");
      } else {
        setErrors("שגיאה בהרשמה. נסו שנית.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>רישום ספק</h2>

        <input style={styles.input} name="username" placeholder="שם משתמש" value={formData.username} onChange={handleInputChange} required />
        <input style={styles.input} type="password" name="password" placeholder="סיסמה" value={formData.password} onChange={handleInputChange} required />
        <input style={styles.input} name="company_name" placeholder="שם חברה" value={formData.company_name} onChange={handleInputChange} required />
        <input style={styles.input} name="phone_number" placeholder="מספר טלפון" value={formData.phone_number} onChange={handleInputChange} required />
        <input style={styles.input} name="representative_name" placeholder="שם נציג" value={formData.representative_name} onChange={handleInputChange} required />

        <h4 style={{ marginTop: 10 }}>הוספת מוצר</h4>
        <input style={styles.input} name="product_name" placeholder="שם מוצר" value={productInput.product_name} onChange={handleProductChange} />
        <input style={styles.input} name="price" placeholder="מחיר" value={productInput.price} onChange={handleProductChange} />
        <input style={styles.input} name="min_quantity" placeholder="כמות מינימלית" value={productInput.min_quantity} onChange={handleProductChange} />
        <button type="button" style={styles.addButton} onClick={addProduct}>הוסף מוצר</button>

        <ul>
          {products.map((p, index) => (
            <li key={index}>{p.product_name} - ₪{p.price} (מינימום {p.min_quantity})</li>
          ))}
        </ul>

        {errors && <p style={{ color: 'red' }}>{errors}</p>}
        {errors && <p style={styles.error}>{errors}</p>}
        {success && <p style={styles.success}>{success}</p>}


        <button type="submit" style={styles.button}>הירשם</button>
        <p style={styles.text}>כבר יש לך חשבון? <a href="/">התחבר</a></p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#f0f2f5',
    paddingTop: '60px'
  },
  form: {
    backgroundColor: 'white', padding: 30, borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: 320, display: 'flex', flexDirection: 'column'
  },
  heading: { textAlign: 'center', marginBottom: 20 },
  input: {
    marginBottom: 10, padding: 10, borderRadius: 6, border: '1px solid #ccc'
  },
  button: {
    marginTop: 10, padding: 10, backgroundColor: '#28a745',
    color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'
  },
  addButton: {
    marginTop: 5, padding: 8, backgroundColor: '#17a2b8',
    color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'
  },
  text: { marginTop: 15, fontSize: '0.9em', textAlign: 'center' },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center'
  }  
};

export default RegisterForm;
