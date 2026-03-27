import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, UserCircle, ShieldCheck, BarChart3, ChevronDown, ChevronRight, Settings as SettingsIcon, ShoppingBag, PackageSearch, PackageOpen, Zap, Route, Truck, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, isMobileOpen, closeMobile }) => {
  const { user } = useContext(AuthContext);
  const [mainMenuOpen, setMainMenuOpen] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(true);

  // Helper closing function forcing automatic navigation closure on Mobile when clicked
  const handleNavClick = () => {
    if (window.innerWidth <= 768 && closeMobile) {
      closeMobile();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '1.5rem 0' : '1.5rem', display: 'flex', alignItems: 'center' }}>
        <div style={{
            minWidth: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #fcd34d 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
            flexShrink: 0
          }}>
            <Zap size={20} fill="white" color="white" />
        </div>
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.75rem', justifyContent: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.05em', color: 'var(--text-color)', lineHeight: 1 }}>HYGLOW</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.2rem' }}>Enterprise ERP</span>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        
        {/* Main Menu Section */}
        <div className="nav-section">
          {!isCollapsed && (
            <div 
              className="nav-section-title" 
              onClick={() => setMainMenuOpen(!mainMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', userSelect: 'none' }}
            >
              <span>MAIN MENU</span>
              {mainMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
          
          {(mainMenuOpen || isCollapsed) && (
            <div className="nav-group">
              <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Dashboard">
                <LayoutDashboard size={20} color="#6366f1" />
                <span className="sidebar-text">Dashboard</span>
              </NavLink>
              <NavLink to="/accounting" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Accounting">
                <FileSpreadsheet size={20} color="#10b981" />
                <span className="sidebar-text">Accounting</span>
              </NavLink>
              <NavLink to="/products" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Products">
                <ShoppingBag size={20} color="#f43f5e" />
                <span className="sidebar-text">Products</span>
              </NavLink>
              <NavLink to="/tracker" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Order Tracker">
                <Route size={20} color="#3b82f6" />
                <span className="sidebar-text">Order Tracker</span>
              </NavLink>
              <NavLink to="/sales-management" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Sales Logistics">
                <PackageOpen size={20} color="#8b5cf6" />
                <span className="sidebar-text">Sales Logistics</span>
              </NavLink>
              <NavLink to="/po-management" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="PO Management">
                <PackageSearch size={20} color="#f59e0b" />
                <span className="sidebar-text">Procurement (PO)</span>
              </NavLink>
              <NavLink to="/inventory" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Inventory Center">
                <PackageSearch size={20} color="#d946ef" />
                <span className="sidebar-text">Inventory Center</span>
              </NavLink>
              <NavLink to="/suppliers" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Suppliers">
                <Truck size={20} color="#06b6d4" />
                <span className="sidebar-text">Vendors / Suppliers</span>
              </NavLink>
              <NavLink to="/reports" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Reports">
                <BarChart3 size={20} color="#ec4899" />
                <span className="sidebar-text">Reports</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Administration Section */}
        <div className="nav-section" style={{ marginTop: isCollapsed ? '0' : '1rem' }}>
          {!isCollapsed && (
            <div 
              className="nav-section-title" 
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', userSelect: 'none' }}
            >
              <span>ADMINISTRATION</span>
              {adminMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
          
          {(adminMenuOpen || isCollapsed) && (
            <div className="nav-group">
              <NavLink to="/profile" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="My Profile">
                <UserCircle size={20} color="#14b8a6" />
                <span className="sidebar-text">My Profile</span>
              </NavLink>
              
              {/* Manager and Admin have Approvals */}
              {(user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/profile-requests" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Profile Requests">
                  <ShieldCheck size={20} color="#0ea5e9" />
                  <span className="sidebar-text">Profile Requests</span>
                </NavLink>
              )}

              {(user?.role === 'Manager' || user?.role === 'Admin') && (
                <NavLink to="/support-tickets" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Support Inbox">
                  <MessageSquare size={20} color="#f43f5e" />
                  <span className="sidebar-text">Support Inbox</span>
                </NavLink>
              )}

              {/* Only Admin has User Management & Permissions */}
              {user?.role === 'Admin' && (
                <>
                  <NavLink to="/user-management" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="User Management">
                    <UserCircle size={20} color="#64748b" />
                    <span className="sidebar-text">User Management</span>
                  </NavLink>
                  <NavLink to="/role-permissions" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Role Permissions">
                    <ShieldCheck size={20} color="#ef4444" />
                    <span className="sidebar-text">Role Permissions</span>
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>

      </nav>

      {/* Support Settings */}
      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: isCollapsed ? '1rem 0' : '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/contact" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }} title="Contact Support">
          <MessageSquare size={20} color="#f43f5e" />
          {!isCollapsed && <span className="sidebar-text">Contact Support</span>}
        </NavLink>
        <NavLink to="/settings" onClick={handleNavClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }} title="Settings">
          <SettingsIcon size={20} color="#94a3b8" />
          {!isCollapsed && <span className="sidebar-text">System Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
