import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, MapPin, PackageCheck, FileText, CheckCircle, Truck, PackageOpen, MoreHorizontal, Map } from 'lucide-react';

const Tracker = () => {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Setting up an interval to simulate live tracking
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [poRes, supRes] = await Promise.all([axios.get('/po'), axios.get('/suppliers')]);
      setPos(poRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || 'Unknown Vendor';

  const STATUSES = ['Pending', 'Approved', 'In Transit', 'Received'];

  if (loading) return <div style={{ padding: '2rem' }}>Loading Live Tracing Grid...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Route size={28} color="var(--primary-color)" /> Live Order Tracker
          </h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Global logistics tracking for active physical deliveries.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', fontWeight: 600 }}>
          <ActivityDot /> System Active & Monitoring
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {pos.length === 0 ? (
           <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
              <Map size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No Cargo Detected</h3>
              <p>There are currently no active Purchase Orders routed in the system.</p>
           </div>
        ) : (
          pos.map(po => {
            const currentStepIndex = STATUSES.indexOf(po.status);
            
            return (
              <div key={po.id} className="card fade-in" style={{ padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                   <div>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        PO-{po.id.toString().padStart(6, '0')} 
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-light)' }}>VENDOR: {getSupplierName(po.supplier_id).toUpperCase()}</span>
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Manifest Issued: {new Date(po.created_at).toLocaleString()}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--error-color)' }}>${po.total_cost.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Shipment Value</div>
                   </div>
                </div>

                {/* Progress Stepper Visualizer */}
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                  
                  {/* Background Track Line */}
                  <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', background: 'var(--border-color)', transform: 'translateY(-50%)', zIndex: 0 }}></div>
                  
                  {/* Active Track Line */}
                  <div style={{ position: 'absolute', top: '50%', left: '10%', width: `${(currentStepIndex / 3) * 80}%`, height: '4px', background: 'var(--primary-color)', transform: 'translateY(-50%)', transition: 'width 0.5s ease-in-out', zIndex: 0 }}></div>

                  {/* Step 1: Pending */}
                  <StepperNode active={currentStepIndex >= 0} completed={currentStepIndex > 0} icon={<FileText size={20} />} label="Draft Placed" />
                  
                  {/* Step 2: Approved */}
                  <StepperNode active={currentStepIndex >= 1} completed={currentStepIndex > 1} icon={<CheckCircle size={20} />} label="Authorized" />
                  
                  {/* Step 3: In Transit */}
                  <StepperNode active={currentStepIndex >= 2} completed={currentStepIndex > 2} icon={<Truck size={20} />} label="In Transit" pulsing={currentStepIndex === 2} />
                  
                  {/* Step 4: Received */}
                  <StepperNode active={currentStepIndex >= 3} completed={currentStepIndex > 3} icon={<PackageCheck size={20} />} label="Delivered" />

                </div>

                {po.status === 'In Transit' && (
                  <div style={{ marginTop: '1.5rem', background: 'rgba(79, 70, 229, 0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                    <MapPin color="var(--primary-color)" size={20} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary-color)', fontWeight: 600 }}>Shipment is actively en route from external logistics. Awaiting final warehouse docking.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const StepperNode = ({ active, completed, icon, label, pulsing }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '100px' }}>
    <div style={{ 
      width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: completed ? 'var(--primary-color)' : active ? 'var(--bg-color)' : 'var(--surface-color)',
      color: completed ? 'white' : active ? 'var(--primary-color)' : 'var(--text-light)',
      border: `2px solid ${completed || active ? 'var(--primary-color)' : 'var(--border-color)'}`,
      boxShadow: pulsing ? '0 0 0 6px rgba(79, 70, 229, 0.2)' : 'none',
      transition: 'all 0.3s'
    }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500, color: active ? 'var(--text-color)' : 'var(--text-light)', textAlign: 'center' }}>
      {label}
    </span>
  </div>
);

const ActivityDot = () => (
  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)', animation: 'pulse 2s infinite' }}>
    <style>{`
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
    `}</style>
  </div>
);

export default Tracker;
