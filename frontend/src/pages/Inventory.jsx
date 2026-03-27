import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Tag, AlertTriangle, Activity } from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'logs'
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const [prodRes, supRes] = await Promise.all([axios.get('/products'), axios.get('/suppliers')]);
        setProducts(prodRes.data);
        setSuppliers(supRes.data);
      } else {
        const logRes = await axios.get('/inventory/logs');
        setLogs(logRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || 'Unknown Vendor';

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Global Inventory Hub</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Live Stock Levels & Immutable Audit Trials</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('stock')} className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', background: activeTab === 'stock' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'stock' ? 'white' : 'var(--text-light)' }}>Warehouse Stock</button>
        <button onClick={() => setActiveTab('logs')} className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', background: activeTab === 'logs' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'logs' ? 'white' : 'var(--text-light)' }}><Activity size={16}/> Audit Trail</button>
      </div>

      <div className="card data-table-container">
        {loading ? <p style={{ padding: '2rem' }}>Loading database clusters...</p> : activeTab === 'stock' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>Vendor</th>
                  <th>Cost / Price</th>
                  <th>Warehouse SLA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.stock_quantity <= p.reorder_level;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{p.sku || 'N/A'}</div>
                      </td>
                      <td>{getSupplierName(p.supplier_id)}</td>
                      <td>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Cost: ${p.cost_price.toFixed(2)}</div>
                        <div style={{ fontWeight: 600 }}>Sell: ${p.price.toFixed(2)}</div>
                      </td>
                      <td>
                         <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{p.stock_quantity}</span>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '0.25rem' }}>(Min: {p.reorder_level})</span>
                      </td>
                      <td>
                        {isLow ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}><AlertTriangle size={12}/> RESTOCK REQUIRED</span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-color)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>OPTIMAL</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log Timestamp</th>
                  <th>Operation Type</th>
                  <th>Asset Target ID</th>
                  <th>Net Quantity Delta</th>
                  <th>Reference Traced</th>
                  <th>Executor (User)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.date).toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: log.type === 'STOCK IN' ? 'var(--success-color)' : log.type === 'STOCK OUT' ? 'var(--warning-color)' : 'var(--primary-color)' }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>ASSET-{log.product_id}</td>
                    <td style={{ fontWeight: 900, color: log.quantity_changed > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                      {log.quantity_changed > 0 ? '+' : ''}{log.quantity_changed}
                    </td>
                    <td>{log.reference || 'Manual Operation'}</td>
                    <td>User #{log.user_id}</td>
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
export default Inventory;
