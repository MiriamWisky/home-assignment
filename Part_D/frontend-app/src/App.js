import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SupplierPage from './pages/SupplierPage';
import OwnerPage from './pages/OwnerPage';
import OwnerOrderPage from './pages/OwnerOrderPage';
import OwnerStatusPage from './pages/OwnerStatusPage';
import OwnerAllOrdersPage from './pages/OwnerAllOrdersPage';
import ManageInventoryPage from './pages/ManageInventoryPage';


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/supplier" element={<SupplierPage />} />
      <Route path="/owner" element={<OwnerPage />} />
      <Route path="/owner/order" element={<OwnerOrderPage />} />
      <Route path="/owner/status" element={<OwnerStatusPage />} />
      <Route path="/owner/all-orders" element={<OwnerAllOrdersPage />} />
      <Route path="/owner/inventory" element={<ManageInventoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
