import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText, Search } from 'lucide-react';

const Reports = () => {
  const [accounting, setAccounting] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        const res = await axios.get('/accounting');
        setAccounting(res.data.sort((a,b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const header = ['ID,Type,Amount(USD),Date,Description\n'];
    const rows = accounting.map(a => `${a.id},${a.type},${a.amount},${new Date(a.date).toISOString()},"${a.description}"\n`);
    const blob = new Blob(header.concat(rows), { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hyglow_financial_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPDF = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Financials...</div>;

  return (
    <div className="fade-in invoice-report-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Advanced Financial Analytics</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Global Revenue & Expense Ledgers</p>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportCSV} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={printPDF} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <FileText size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="card data-table-container printable-area">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Consolidated Master Ledger</h2>
        </div>
        
        {accounting.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
             <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
             <h3>Ledger Empty</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Financial Index</th>
                  <th>Classification</th>
                  <th>Timestamp</th>
                  <th>Justification / Reference</th>
                  <th style={{ textAlign: 'right' }}>Net Flow (USD)</th>
                </tr>
              </thead>
              <tbody>
                {accounting.map((acc) => (
                  <tr key={acc.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>LEDGER-{acc.id.toString().padStart(5, '0')}</td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                        backgroundColor: acc.type === 'invoice' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: acc.type === 'invoice' ? 'var(--success-color)' : 'var(--error-color)'
                      }}>
                        {acc.type}
                      </span>
                    </td>
                    <td>{new Date(acc.date).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{acc.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: acc.type === 'invoice' ? 'var(--success-color)' : 'var(--text-color)' }}>
                      {acc.type === 'invoice' ? '+' : '-'}${acc.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-report-page, .invoice-report-page * { visibility: visible; }
          .invoice-report-page { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
