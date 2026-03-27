import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Plus, Mail, MapPin, Search } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', email: '', address: '', payment_terms: 'Net 30' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/suppliers', form);
      setShowAddForm(false);
      setForm({ name: '', contact_name: '', email: '', address: '', payment_terms: 'Net 30' });
      fetchSuppliers();
    } catch (err) {
      alert("Failed to provision vendor.");
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Supplier Management</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Active Supply Chain Vending Partners</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> {showAddForm ? 'Cancel Creation' : 'Onboard New Vendor'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="card fade-in" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Onboard Supplier</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Vendor Corporate Name</label>
              <input type="text" className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Key Contact Person</label>
              <input type="text" className="form-input" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Billing / Operations Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms SLA</label>
              <select className="form-input" value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})}>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Upfront">Upfront / Prepaid</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Physical Dispatch Address</label>
              <textarea className="form-input" rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Onboard Supplier</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading vendors...</p> : suppliers.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}><Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} /><h3>No Vendors Found</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {suppliers.map(sup => (
            <div key={sup.id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{sup.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>ID: VENDOR-{sup.id.toString().padStart(4, '0')}</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                  <Mail size={16} color="var(--text-light)" /> {sup.email || 'No email provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
                  <MapPin size={16} color="var(--text-light)" /> {sup.address || 'No physical address'}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-light)' }}>Terms: <strong>{sup.payment_terms}</strong></span>
                  <span style={{ color: 'var(--text-light)' }}>Contact: <strong>{sup.contact_name}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Suppliers;
