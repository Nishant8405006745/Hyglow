import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, CheckCircle, PackageOpen } from 'lucide-react';

const POManagement = () => {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes] = await Promise.all([axios.get('/po'), axios.get('/suppliers')]);
      setPos(poRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const advanceStatus = async (poId) => {
    try {
      await axios.put(`/po/${poId}/advance`);
      fetchData();
    } catch (err) {
      alert("Failed to advance PO workflow status. Check warehouse capabilities.");
    }
  };

  const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || 'Unknown';

  if (loading) return <div style={{ padding: '2rem' }}>Synchronizing Purchase Ledgers...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Supplier Purchasing (PO)</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage inbound Restock Orders and Delivery Statuses</p>
        </div>
      </div>

      <div className="card data-table-container">
        {pos.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <PackageOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No Pending Purchase Orders</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Reference</th>
                  <th>Vendor Identity</th>
                  <th>Order Cost Value</th>
                  <th>Issued Date</th>
                  <th>Workflow Status</th>
                  <th>Receiving Action</th>
                </tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td><div style={{ fontWeight: 800 }}>PO-{po.id.toString().padStart(6, '0')}</div></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={16} color="var(--primary-color)" /> {getSupplierName(po.supplier_id)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--error-color)' }}>
                      -${po.total_cost.toFixed(2)}
                    </td>
                    <td>{new Date(po.created_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: po.status === 'Received' ? 'rgba(16, 185, 129, 0.1)' : po.status === 'In Transit' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: po.status === 'Received' ? 'var(--success-color)' : po.status === 'In Transit' ? '#3b82f6' : 'var(--warning-color)'
                      }}>
                        {po.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {po.status === 'Received' ? (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} color="var(--success-color)"/> Fully Received & Stocked
                        </span>
                      ) : (
                       <button onClick={() => advanceStatus(po.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          Advance → {po.status === 'Pending' ? 'Approve' : po.status === 'Approved' ? 'Ship/Transit' : 'Deliver to Warehouse'}
                        </button>
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
export default POManagement;
