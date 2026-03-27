import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShoppingCart, CheckCircle, PackageSearch, Tag, PlusCircle, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  
  // B2B Category Filtering
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Bulk Quantity State (Tracking individual input values for each card)
  const [bulkInputs, setBulkInputs] = useState({});
  
  // Add Product Management
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', description: '', price: '', cost_price: '', supplier_id: 1, stock_quantity: '', reorder_level: 5, image_url: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
      
      // Initialize bulk inputs to 1 for convenience
      const initialInputs = {};
      res.data.forEach(p => initialInputs[p.id] = 1);
      setBulkInputs(initialInputs);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkInputChange = (productId, val) => {
    setBulkInputs(prev => ({ ...prev, [productId]: parseInt(val) || '' }));
  };

  const addToCartBulk = (product) => {
    const quantity = bulkInputs[product.id] || 0;
    
    if (quantity <= 0) return;
    if (quantity > product.stock_quantity) {
      alert(`Insufficient Inventory! Only ${product.stock_quantity} units available for ${product.name}.`);
      return;
    }

    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      // If adding again, try to sum it, but still enforce cap.
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock_quantity) {
         alert(`Cannot add ${quantity} more. Maximum inventory cap reached.`);
         return;
      }
      setCart(cart.map(i => i.product_id === product.id ? { ...i, quantity: newQty } : i));
    } else {
      setCart([...cart, { product_id: product.id, quantity, unit_price: product.price, name: product.name }]);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const raiseSalesOrder = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post('/sales/raise', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        total_revenue: totalAmount
      });
      setMessage('SUCCESS: Sales Order processed! Awaiting Dispatch in Sales Management.');
      setCart([]);
    } catch (err) {
      setMessage('FAILED: Could not raise Sales Order.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost_price: parseFloat(newProduct.cost_price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        reorder_level: parseInt(newProduct.reorder_level),
        supplier_id: parseInt(newProduct.supplier_id)
      });
      setMessage('SUCCESS: New product cataloged successfully.');
      setIsAdding(false);
      setNewProduct({ name: '', sku: '', category: '', description: '', price: '', cost_price: '', supplier_id: 1, stock_quantity: '', reorder_level: 5, image_url: '' });
      fetchProducts();
    } catch (err) {
      setMessage('FAILED: Could not create product. Check specifications.');
    }
  };

  // Extract unique categories for the B2B Tab Menu
  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => (p.category || 'General') === selectedCategory);

  if (loading) return <div style={{ padding: '2rem' }}>Synchronizing Catalog...</div>;

  return (
    <div className="fade-in">
      
      {/* Dynamic Header & Cart */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-color)', margin: 0 }}>Electrical Systems Catalog</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>B2B Industrial Procurement Hub</p>
        </div>
        
        {cart.length > 0 && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-color)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--primary-color)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-light)' }}>PENDING PO DRAFT</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-color)' }}>
                <ShoppingCart size={18} color="var(--primary-color)" />
                {cart.reduce((s, i) => s + i.quantity, 0)} units (${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})})
              </div>
            </div>
            <button onClick={raiseSalesOrder} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontWeight: 700, letterSpacing: '0.05em' }}>RAISE SALES ORDER</button>
          </div>
        )}
        
        {/* Manager Action */}
        {(user?.role === 'Manager' || user?.role === 'Admin') && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary fade-in" style={{ padding: '0.75rem 1.5rem', fontWeight: 700, borderRadius: '999px', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)' }}>
            <PlusCircle size={20} /> Add New Product
          </button>
        )}
      </div>

      {/* Creation Modal / Inline Card */}
      {isAdding && (
        <div className="card fade-in" style={{ marginBottom: '2rem', border: '2px dashed var(--primary-color)', background: 'var(--surface-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={24} /> Register New Logistics Product
            </h3>
            <button onClick={() => setIsAdding(false)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}><X size={20}/></button>
          </div>
          <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Asset Name</label><input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. 500kVA Transformer" /></div>
            <div className="form-group"><label className="form-label">SKU</label><input type="text" className="form-input" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="TR-500KVA-01" /></div>
            <div className="form-group"><label className="form-label">Category</label><input type="text" className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Distribution" /></div>
            <div className="form-group"><label className="form-label">Image URL (HTTPS)</label><input type="url" className="form-input" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." /></div>
            <div className="form-group"><label className="form-label">Selling Price ($)</label><input type="number" step="0.01" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Cost Price ($)</label><input type="number" step="0.01" className="form-input" required value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Initial Stock</label><input type="number" className="form-input" required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Detailed Specs</label><textarea className="form-input" rows="2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Industrial capacity, specs, etc..." /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 700 }}>Deploy Product &rarr;</button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className="fade-in" style={{ 
          padding: '1rem', 
          backgroundColor: message.startsWith('SUCCESS') ? '#10b981' : 'rgba(239, 68, 68, 0.1)', 
          color: message.startsWith('SUCCESS') ? 'white' : 'var(--error-color)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-md)'
        }}>
          <CheckCircle size={20} /> {message}
        </div>
      )}

      {/* Modern B2B Category Filter Tabs */}
      {products.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : 'var(--surface-color)',
                color: selectedCategory === cat ? 'white' : 'var(--text-color)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: selectedCategory === cat ? '0 4px 6px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid Rendering */}
      {filteredProducts.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
          <PackageSearch size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No products in this category</h3>
          <p>Change your filter or await supplier replenishment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              
              {/* Image Header */}
              <div style={{ height: '220px', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)' }}>No Graphic Available</div>
                )}
                
                {/* Visual Taxonomy overlay */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(17, 24, 39, 0.8)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(4px)' }}>
                  <Tag size={12}/> {product.category || 'General'}
                </div>

                {product.stock_quantity === 0 && (
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem', backdropFilter: 'blur(2px)' }}>
                     DEPLETED STOCK
                   </div>
                )}
              </div>

              {/* Data Core */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>{product.name}</h3>
                </div>
                
                {/* B2B Pricing Structure */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.5rem' }}>
                    ${product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                  </span>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>/ unit</span>
                </div>

                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                  {product.description || 'No industrial specifications provided for this asset.'}
                </p>
                
                {/* Bulk Order Mechanism */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: product.stock_quantity > 0 ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 600 }}>
                      Warehouse SLA: {product.stock_quantity} available
                    </span>
                  </div>
                  
                  {product.stock_quantity > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        min="1" 
                        max={product.stock_quantity}
                        value={bulkInputs[product.id] === undefined ? '' : bulkInputs[product.id]}
                        onChange={(e) => handleBulkInputChange(product.id, e.target.value)}
                        className="form-input" 
                        style={{ width: '80px', padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}
                        title="Bulk Quantity"
                      />
                      <button 
                        onClick={() => addToCartBulk(product)} 
                        className="btn btn-primary" 
                        style={{ flex: 1, fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                      >
                       <ShoppingCart size={18}/> Draft Sales Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
