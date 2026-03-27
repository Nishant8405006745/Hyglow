import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, PackageSearch, Activity, Link, FileText, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({ revenue: 0, costs: 0, active_sales_orders: 0, active_purchase_orders: 0, total_stock: 0, low_stock_alerts: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const metricRes = await axios.get('/dashboard/metrics');
      setMetrics(metricRes.data);

      if (user?.role === 'Admin' || user?.role === 'Manager') {
        const salesRes = await axios.get('/sales');
        setRecentSales(salesRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading ERP Telemetry...</div>;

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>Enterprise Telemetry</h1>
      
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '4px solid var(--success-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue</h3>
                <TrendingUp size={20} color="var(--success-color)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: 'var(--text-color)' }}>
                ${metrics.revenue.toLocaleString()}
              </p>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '4px solid var(--error-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Supplier Costs</h3>
                <Activity size={20} color="var(--error-color)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: 'var(--text-color)' }}>
                ${metrics.costs.toLocaleString()}
              </p>
            </div>
          </>
        )}

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Active SLA Routes</h3>
            <FileText size={20} color="var(--primary-color)" />
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
             <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>{metrics.active_sales_orders}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Sales</span>
             </div>
             <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>{metrics.active_purchase_orders}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Restocks</span>
             </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: metrics.low_stock_alerts > 0 ? '4px solid var(--warning-color)' : '4px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Warehouse Health</h3>
            {metrics.low_stock_alerts > 0 ? <AlertTriangle size={20} color="var(--warning-color)" /> : <PackageSearch size={20} color="var(--text-light)" />}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
             <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>{metrics.total_stock}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total Units</span>
             </div>
             <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: metrics.low_stock_alerts > 0 ? 'var(--warning-color)' : 'var(--text-color)', margin: 0 }}>{metrics.low_stock_alerts}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Low Stock</span>
             </div>
          </div>
        </div>
      </div>

      {(user?.role === 'Admin' || user?.role === 'Manager') && (
        <div className="card data-table-container">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Recent Sales Traces</h2>
            <a href="/sales-management" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View Logistics <Link size={14}/></a>
          </div>
          {recentSales.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No active revenue operations registered.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trace Index</th>
                    <th>Date</th>
                    <th>Pipeline Ref</th>
                    <th>Generated Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(so => (
                    <tr key={so.id}>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>SO-{so.id.toString().padStart(6, '0')}</td>
                      <td>{new Date(so.created_at).toLocaleDateString()}</td>
                      <td>User #{so.user_id}</td>
                      <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>+${so.total_revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
