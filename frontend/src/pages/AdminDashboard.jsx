import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, ShoppingCart, Users, Package, AlertTriangle, 
  Plus, Edit, Trash2, ShieldCheck, ChevronRight, CheckCircle2, 
  X, BarChart3, TrendingUp, Layers, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi, productApi } from '../api/api';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'orders'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Product Form State (Create / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState(1);
  const [prodBrand, setProdBrand] = useState(1);
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodImage, setProdImage] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsFlashDeal, setProdIsFlashDeal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadAllAdminData();
  }, [isAdmin, navigate]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, brandRes, ordersRes] = await Promise.all([
        adminApi.getStats(),
        productApi.getProducts({ limit: 100 }),
        productApi.getCategories(),
        productApi.getBrands(),
        adminApi.getOrders()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
      if (brandRes.success) setBrands(brandRes.brands);
      if (ordersRes.success) setOrders(ordersRes.orders);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      addToast('Error loading admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdCategory(categories[0]?.id || 1);
    setProdBrand(brands[0]?.id || 1);
    setProdDescription('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdStock('50');
    setProdImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800');
    setProdIsFeatured(false);
    setProdIsTrending(false);
    setProdIsFlashDeal(false);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProductId(p.id);
    setProdTitle(p.title);
    setProdCategory(p.category_id || 1);
    setProdBrand(p.brand_id || 1);
    setProdDescription(p.description);
    setProdPrice(p.price);
    setProdOriginalPrice(p.original_price);
    setProdStock(p.stock);
    setProdImage(p.main_image);
    setProdIsFeatured(p.is_featured);
    setProdIsTrending(p.is_trending);
    setProdIsFlashDeal(p.is_flash_deal);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: prodTitle,
        category_id: Number(prodCategory),
        brand_id: Number(prodBrand),
        description: prodDescription,
        price: parseFloat(prodPrice),
        original_price: parseFloat(prodOriginalPrice || prodPrice),
        stock: parseInt(prodStock),
        main_image: prodImage,
        images: [prodImage],
        is_featured: prodIsFeatured,
        is_trending: prodIsTrending,
        is_flash_deal: prodIsFlashDeal
      };

      if (editingProductId) {
        const res = await adminApi.updateProduct(editingProductId, payload);
        if (res.success) {
          addToast('Product updated successfully!', 'success');
        }
      } else {
        const res = await adminApi.createProduct(payload);
        if (res.success) {
          addToast('New product created!', 'success');
        }
      }
      setShowProductModal(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently from the catalog?')) return;
    try {
      const res = await adminApi.deleteProduct(productId);
      if (res.success) {
        addToast('Product removed', 'info');
        loadAllAdminData();
      }
    } catch (err) {
      addToast(err.message || 'Could not delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        addToast(`Order status set to ${newStatus}`, 'success');
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      }
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      
      {/* Dashboard Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-purple" style={{ display: 'flex', gap: '4px' }}>
              <ShieldCheck size={13} /> EXECUTIVE PORTAL
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>LUNA Operational Center</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            Admin Analytics & Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadAllAdminData} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        {[
          { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
          { id: 'products', label: `Inventory Management (${products.length})`, icon: Package },
          { id: 'orders', label: `Order Lifecycle (${orders.length})`, icon: ShoppingCart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#38BDF8' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* KPI Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>Total Revenue</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}><DollarSign size={20} /></div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <TrendingUp size={12} /> Live Net Volume
              </span>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>Total Orders</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary)' }}><ShoppingCart size={20} /></div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                {stats.total_orders}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
                Across all fulfillment stages
              </span>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>Customer Accounts</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}><Users size={20} /></div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                {stats.total_users}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
                Registered clients
              </span>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>Active Catalog</span>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}><Package size={20} /></div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                {stats.total_products}
              </div>
              <span style={{ fontSize: '0.75rem', color: stats.low_stock_count > 0 ? '#FB7185' : '#10B981', marginTop: '6px', display: 'block' }}>
                {stats.low_stock_count} low-stock alerts
              </span>
            </div>
          </div>

          {/* Revenue Trends & Category Sales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Category Performance */}
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Category Sales Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stats.category_sales.map((cat, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                      <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{cat.category}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>${cat.sales.toFixed(2)} ({cat.items_sold} sold)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (cat.sales / (stats.total_revenue || 1)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 100%)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Fulfillment Pipeline</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {Object.entries(stats.status_breakdown || {}).map(([st, cnt]) => (
                  <div key={st} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{st}</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>{cnt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="glass-panel" style={{ padding: '28px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Catalog Inventory Table</h2>
            <button onClick={handleOpenCreateModal} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Stock</th>
                <th style={{ padding: '12px' }}>Rating</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={p.main_image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#090D16' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{p.title}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{p.brand}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#94A3B8' }}>{p.category}</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#F8FAFC' }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: p.stock > 10 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: p.stock > 10 ? '#10B981' : '#F43F5E'
                    }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#FBBF24', fontWeight: 600 }}>★ {p.rating}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: '4px' }}
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: '4px' }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ORDER LIFECYCLE MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '28px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Customer Orders Lifecycle</h2>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Recipient</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Payment</th>
                <th style={{ padding: '12px' }}>Current Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Update Milestone</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
                  <td style={{ padding: '12px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {o.order_number}
                  </td>
                  <td style={{ padding: '12px', color: '#F8FAFC' }}>
                    {o.address?.full_name || 'Customer'}
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.address?.city || ''}</div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#F8FAFC' }}>${o.total.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#94A3B8', fontSize: '0.8rem' }}>
                    {o.payment_method} ({o.payment_status})
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${
                      o.status === 'DELIVERED' ? 'badge-emerald' : 
                      o.status === 'SHIPPED' ? 'badge-cyan' : 
                      o.status === 'CANCELLED' ? 'badge-rose' : 'badge-amber'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="input-field"
                      style={{ padding: '4px 10px', fontSize: '0.8rem', width: 'auto', display: 'inline-block' }}
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div
            className="glass-panel"
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {editingProductId ? 'Edit Product' : 'Add New Hardware Product'}
              </h2>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Title</label>
                <input required className="input-field" value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} placeholder="Product Name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select className="input-field" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Brand</label>
                  <select className="input-field" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)}>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea required rows="3" className="input-field" value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Selling Price ($)</label>
                  <input required type="number" step="0.01" className="input-field" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Original Price ($)</label>
                  <input type="number" step="0.01" className="input-field" value={prodOriginalPrice} onChange={(e) => setProdOriginalPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Stock Units</label>
                  <input required type="number" className="input-field" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Main Image URL</label>
                <input required className="input-field" value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '20px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} />
                  Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={prodIsTrending} onChange={(e) => setProdIsTrending(e.target.checked)} />
                  Trending
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={prodIsFlashDeal} onChange={(e) => setProdIsFlashDeal(e.target.checked)} />
                  Flash Deal
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Product</button>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
