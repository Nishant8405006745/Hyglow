import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Edit2, CheckCircle2, Clock, XCircle, Phone, Camera } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    username: user?.username || '', 
    email: user?.email || '', 
    mobile: user?.mobile || '',
    profile_photo: user?.profile_photo || '',
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // Limit to 2MB
        setMessage('Failed: Profile photo must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Build requested changes object
      const changes = {};
      if (formData.username && formData.username !== user.username) changes.username = formData.username;
      if (formData.email && formData.email !== user.email) changes.email = formData.email;
      if (formData.mobile && formData.mobile !== user.mobile) changes.mobile = formData.mobile;
      if (formData.profile_photo && formData.profile_photo !== user.profile_photo) changes.profile_photo = formData.profile_photo;
      if (formData.password && formData.password.trim() !== '') changes.password = formData.password;

      if (Object.keys(changes).length === 0) {
        setMessage('No changes detected.');
        setLoading(false);
        return;
      }

      await axios.post('/profile/request', { requested_changes: changes });
      setMessage('SUCCESS: Profile edit request sent for approval.');
      setFormData(prev => ({ ...prev, password: '' })); // reset password field
    } catch (err) {
      setMessage('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>My Profile</h1>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <User size={24} color="var(--primary-color)" /> Edit Personal Details
        </h2>
        
        {message && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: message.includes('SUCCESS') ? '#10b981' : 'rgba(239, 68, 68, 0.1)', 
            color: message.includes('SUCCESS') ? 'white' : 'var(--error-color)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            fontWeight: 600,
            boxShadow: message.includes('SUCCESS') ? 'var(--shadow-md)' : 'none'
          }}>
            {message.includes('No changes') || message.includes('Failed') ? <XCircle size={20} /> : <CheckCircle2 size={24} />} {message.replace('SUCCESS: ', '')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div 
              onClick={handlePhotoClick}
              title="Click to change profile photo"
              style={{ 
                position: 'relative', 
                cursor: 'pointer', 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--background)', 
                border: '3px solid var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={56} color="var(--text-light)" />
              )}
              
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '30%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={18} color="white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className="form-input" 
              value={formData.username} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14}/> Mobile Number</label>
            <input 
              type="text" 
              name="mobile"
              className="form-input" 
              value={formData.mobile} 
              onChange={handleChange} 
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              value={formData.password} 
              onChange={handleChange} 
              minLength={4}
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Edit2 size={16} />
            {user?.role === 'Admin' ? 'Save Changes' : 'Request Change'}
          </button>
        </form>
      </div>

      {user?.role !== 'Admin' && !message.includes('SUCCESS') && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--warning-color)', display: 'flex', gap: '0.5rem', maxWidth: '600px' }}>
          <Clock size={20} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Approval Required</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Any changes you make to your profile must be approved by an Admin before they take effect.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
