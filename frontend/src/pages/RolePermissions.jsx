import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const RolePermissions = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  
  // Available granular permissions matrix
  const permissionTypes = [
    { key: 'can_export_excel', label: 'Export Data (Excel)' },
    { key: 'can_edit_accounting', label: 'Edit Accounting Data' },
    { key: 'can_view_reports', label: 'View Analytics Reports' }
  ];

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

  const handleTogglePermission = async (targetUser, permKey) => {
    try {
      const currentPerms = targetUser.permissions || {};
      const newPerms = { ...currentPerms, [permKey]: !currentPerms[permKey] };
      
      await axios.put(`/users/${targetUser.id}/permissions`, { permissions: newPerms });
      fetchUsers(); // Refresh UI
    } catch (err) {
      alert("Failed to update user permissions.");
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
        <ShieldCheck size={28} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Role Permissions Matrix</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Individually toggle granular module access permissions for specific users. System Admins implicitly bypass these restrictions internally.</p>

      <div className="card data-table-container fade-in" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                {permissionTypes.map(pt => (
                  <th key={pt.key} style={{ textAlign: 'center' }}>{pt.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{u.username}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600, 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: u.role === 'Admin' ? 'rgba(79, 70, 229, 0.1)' : u.role === 'Manager' ? 'rgba(16, 185, 129, 0.1)' : 'var(--background)',
                      color: u.role === 'Admin' ? 'var(--primary-color)' : u.role === 'Manager' ? 'var(--success-color)' : 'var(--text-light)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  
                  {/* Permission Toggles */}
                  {permissionTypes.map(pt => {
                    const hasPerm = u.permissions && u.permissions[pt.key] === true;
                    // Disable toggling for Admins or self
                    const isDisabled = u.role === 'Admin' || u.id === user.id;

                    return (
                      <td key={pt.key} style={{ textAlign: 'center' }}>
                        <div 
                          onClick={() => !isDisabled && handleTogglePermission(u, pt.key)}
                          style={{
                            display: 'inline-flex',
                            width: '40px',
                            height: '24px',
                            backgroundColor: hasPerm ? 'var(--primary-color)' : (isDisabled ? 'var(--border-color)' : '#d1d5db'),
                            borderRadius: '12px',
                            padding: '2px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            opacity: isDisabled ? 0.5 : 1
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'transform 0.2s',
                            transform: hasPerm ? 'translateX(16px)' : 'translateX(0)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
