import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Accounting from './pages/Accounting';
import Profile from './pages/Profile';
import ProfileRequests from './pages/ProfileRequests';
import UserManagement from './pages/UserManagement';
import RolePermissions from './pages/RolePermissions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Tracker from './pages/Tracker';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import POManagement from './pages/POManagement';
import SalesManagement from './pages/SalesManagement';
import Suppliers from './pages/Suppliers';
import ContactUs from './pages/ContactUs';
import SupportTickets from './pages/SupportTickets';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading access...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="auth-wrapper"><div className="auth-card fade-in">Loading Application...</div></div>;

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        
        {/* Authed Routes wrapped in Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="products" element={<Products />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="sales-management" element={<SalesManagement />} />
          <Route path="po-management" element={<POManagement />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Manager and Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><Outlet /></ProtectedRoute>}>
            <Route path="profile-requests" element={<ProfileRequests />} />
            <Route path="support-tickets" element={<SupportTickets />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']}><Outlet /></ProtectedRoute>}>
            <Route path="user-management" element={<UserManagement />} />
            <Route path="role-permissions" element={<RolePermissions />} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}

export default App;
