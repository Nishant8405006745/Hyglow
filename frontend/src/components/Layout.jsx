import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Bell, Menu } from 'lucide-react';
import axios from 'axios';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/profile/requests');
      const pending = res.data.filter(req => req.status === 'Pending');
      setNotificationCount(pending.length);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      {/* Overlay Backdrop for Mobile */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileOpen(false)} 
      />

      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        closeMobile={() => setIsMobileOpen(false)} 
      />
      
      <div className="main-content">
        <header className="top-header" style={{ justifyContent: 'space-between' }}>
          
          <div>
            <button 
              onClick={() => {
                // Desktop toggle, Mobile slide
                if (window.innerWidth <= 768) {
                  setIsMobileOpen(!isMobileOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }} 
              className="btn btn-outline" 
              style={{ padding: '0.5rem', border: 'none' }}
            >
              <Menu size={24} color="var(--primary-color)" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <Link to="/profile-requests" style={{ position: 'relative', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <Bell size={22} color="var(--warning-color)" />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </Link>
            )}

            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-color)', textDecoration: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" className="profile-avatar" />
              ) : (
                <User size={22} color="var(--primary-color)" />
              )}
              <span style={{ fontWeight: 700, display: window.innerWidth > 768 ? 'inline' : 'none' }}>
                  {user?.username} <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({user?.role})</span>
              </span>
            </Link>
            
            <button onClick={logout} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontWeight: 700 }}>
              <LogOut size={16} color="var(--error-color)" /> <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>Logout</span>
            </button>
          </div>
        </header>
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
