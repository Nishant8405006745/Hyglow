import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Users } from 'lucide-react';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/users/${userId}/role`, { username: "", email: "", role: newRole });
      fetchUsers();
    } catch (err) {
      alert("Failed to change user role.");
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--error-color)' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Users size={28} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--text-color)', margin: 0 }}>User Management</h1>
      </div>

      <div className="card data-table-container fade-in" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>System Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td style={{ fontWeight: 500 }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.mobile || '-'}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 600, 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: u.role === 'Admin' ? 'rgba(79, 70, 229, 0.1)' : u.role === 'Manager' ? 'rgba(16, 185, 129, 0.1)' : 'var(--background)',
                      color: u.role === 'Admin' ? 'var(--primary-color)' : u.role === 'Manager' ? 'var(--success-color)' : 'var(--text-light)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-input" 
                      style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.875rem' }} 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.id, e.target.value)} 
                      disabled={u.id === user.id}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
