import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, User, Tag, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SupportTickets = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/support/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (id) => {
    try {
      await axios.put(`/support/tickets/${id}/resolve`);
      setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = filter === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Support Inbox...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={28} color="var(--primary-color)" />
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Support Inbox</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {['All', 'Open', 'Resolved'].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: filter === status ? 'var(--primary-color)' : 'transparent',
                color: filter === status ? 'white' : 'var(--text-color)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
          <CheckCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No support tickets found</h3>
          <p>Everything is currently running smoothly.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="card fade-in" style={{ borderLeft: `4px solid ${ticket.status === 'Open' ? 'var(--warning-color)' : 'var(--success-color)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '999px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      background: ticket.status === 'Open' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: ticket.status === 'Open' ? 'var(--warning-color)' : 'var(--success-color)'
                    }}>
                      {ticket.status}
                    </span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} /> {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{ticket.subject}</h3>
                </div>
                
                {ticket.status === 'Open' && (
                  <button 
                    onClick={() => resolveTicket(ticket.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
              
              <p style={{ color: 'var(--text-color)', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0 0 1rem 0', whiteSpace: 'pre-wrap' }}>
                {ticket.message}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ticket.user?.profile_photo ? (
                    <img src={ticket.user.profile_photo} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  ) : (
                    <User size={20} color="var(--primary-color)" />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {ticket.user?.username} <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>({ticket.user?.email})</span>
                  </span>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                  Ticket ID: #{ticket.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
