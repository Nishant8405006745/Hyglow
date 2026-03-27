import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, CheckCircle, PackageSearch } from 'lucide-react';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('/sales');
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dispatchOrder = async (soId) => {
    try {
      await axios.put(`/sales/${soId}/dispatch`);
      fetchSales();
    } catch (err) {
      alert("Failed to dispatch order. Check if you have sufficient Inventory Stock in the warehouse!");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Sales Data...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Sales & Order Processing</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Fulfill client orders, deduct stock, and generate gross revenue invoices</p>
        </div>
      </div>

      <div className="card data-table-container">
        {sales.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <PackageSearch size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No Customer Sales Orders Generated</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sales Reference</th>
                  <th>Client Pipeline User</th>
                  <th>Gross Revenue Created</th>
                  <th>Checkout Time</th>
                  <th>Fulfillment Status</th>
                  <th>Dispatch Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(so => (
                  <tr key={so.id}>
                    <td><div style={{ fontWeight: 800 }}>SO-{so.id.toString().padStart(6, '0')}</div></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        User #{so.user_id}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success-color)' }}>
                      +${so.total_revenue.toFixed(2)}
                    </td>
                    <td>{new Date(so.created_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: so.status === 'Dispatched' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: so.status === 'Dispatched' ? 'var(--success-color)' : 'var(--warning-color)'
                      }}>
                        {so.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {so.status === 'Pending' ? (
                        <button onClick={() => dispatchOrder(so.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, background: 'var(--success-color)', border: 'none' }}>
                          <ShoppingBag size={14} style={{ marginRight: '0.25rem' }}/> Dispatch & Deduct Stock
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <CheckCircle size={14} color="var(--success-color)"/> Dispatched / Invoiced
                        </span>
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
export default SalesManagement;
