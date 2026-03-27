import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Download, Upload, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Accounting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/accounting');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/accounting/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'accounting_data.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/accounting/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData(); // Refresh data
      alert('File imported successfully!');
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import file. You may need Manager/Admin access.');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-color)' }}>Accounting Overview</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExport} className="btn btn-outline">
            <Download size={16} /> Export Excel
          </button>
          
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Import Excel
              <input type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleImport} />
            </label>
          )}
        </div>
      </div>

      <div className="card data-table-container">
        {loading ? (
          <p style={{ padding: '2rem' }}>Loading records...</p>
        ) : data.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No accounting records found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                    <td style={{ fontWeight: 600, color: item.type === 'expense' ? 'var(--error-color)' : 'inherit' }}>
                      {item.amount.toLocaleString()}
                    </td>
                    <td>{item.currency}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.description}</td>
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

export default Accounting;
