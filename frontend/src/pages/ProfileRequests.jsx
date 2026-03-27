import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Check, X, Clock } from 'lucide-react';

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/profile/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await axios.post(`/profile/requests/${id}/${decision}`);
      fetchRequests(); // Refresh
    } catch (err) {
      alert(`Failed to ${decision} request.`);
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Profile Edit Approvals</h1>

      <div className="card data-table-container">
        {loading ? (
          <p style={{ padding: '2rem' }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No pending profile requests.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>User ID</th>
                  <th>Requested Changes</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>
                    <td>{req.user_id}</td>
                    <td>
                      <pre style={{ fontSize: '0.75rem', background: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(
                          {
                            ...req.requested_changes,
                            ...(req.requested_changes.profile_photo && { profile_photo: "[New Photo Uploaded]" })
                          }, 
                          null, 2
                        )}
                      </pre>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: req.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : req.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: req.status === 'Pending' ? 'var(--warning-color)' : req.status === 'Approved' ? 'var(--success-color)' : 'var(--error-color)'
                      }}>
                        {req.status === 'Pending' && <Clock size={12} />}
                        {req.status === 'Approved' && <Check size={12} />}
                        {req.status === 'Rejected' && <X size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td>{new Date(req.created_at).toLocaleString()}</td>
                    <td>
                      {req.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleDecision(req.id, 'approve')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem' }}>
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleDecision(req.id, 'reject')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
