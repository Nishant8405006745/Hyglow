import React, { useState } from 'react';
import axios from 'axios';
import { Mail, MessageSquare, PhoneCall, Send, CheckCircle, AlertTriangle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({ subject: 'Technical Support', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    
    try {
      await axios.post('/support/tickets', formData);
      setSubmitted(true);
      setError('');
      setFormData({ subject: 'Technical Support', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Could not transmit your message. Please try again or use direct hotline.');
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <MessageSquare size={28} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Contact Support</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Need assistance with your HYGLOW Enterprise ERP suite? Reach out to our technical administrators or logistics coordinators here.
      </p>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <PhoneCall size={24} color="#3b82f6" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Direct Hotline</h3>
          <p style={{ color: 'var(--text-light)', margin: 0, fontWeight: 600 }}>+1 (800) 555-0199</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Mon-Fri, 9am - 6pm EST</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Mail size={24} color="#ec4899" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Email Support</h3>
          <p style={{ color: 'var(--text-light)', margin: 0, fontWeight: 600 }}>support@hyglow.systems</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>24/7 Ticketing System</span>
        </div>
      </div>

      {submitted && (
        <div className="fade-in" style={{ padding: '1rem', backgroundColor: '#10b981', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
          <CheckCircle size={20} /> Your message has been successfully dispatched to the Support Team.
        </div>
      )}

      {error && (
        <div className="fade-in" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, border: '1px solid var(--error-color)' }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Send an Inquiry</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label className="form-label">Inquiry Subject</label>
            <select 
              className="form-input" 
              value={formData.subject} 
              onChange={e => setFormData({...formData, subject: e.target.value})}
            >
              <option value="Technical Support">Technical & System Support</option>
              <option value="Access Request">Account & Access Control</option>
              <option value="Feature Request">Platform Feature Request</option>
              <option value="Billing">Billing & Enterprise Plans</option>
            </select>
          </div>

          <div>
            <label className="form-label">Detailed Message</label>
            <textarea 
              className="form-input" 
              rows="5" 
              placeholder="Describe your issue or inquiry in detail..."
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} /> Transmit Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
