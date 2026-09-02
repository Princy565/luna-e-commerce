import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Truck, Clock, CheckCircle2, XCircle, 
  ChevronRight, ArrowRight, ShieldCheck, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/api';
import TrackingTimeline from '../components/TrackingTimeline';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrders();
        if (res.success) setOrders(res.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        addToast('Order cancelled successfully', 'info');
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err) {
      addToast(err.message || 'Could not cancel order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-emerald">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-cyan">In Transit (Air Express)</span>;
      case 'PROCESSING':
        return <span className="badge badge-purple">Packed & Processing</span>;
      case 'CANCELLED':
        return <span className="badge badge-rose">Cancelled</span>;
      default:
        return <span className="badge badge-amber">Placed & Confirmed</span>;
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Orders & Shipments</h1>
          <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Track live courier milestones and view purchase history</span>
        </div>
        <Link to="/products" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          Explore Hardware
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card skeleton" style={{ height: '140px', padding: '20px' }} />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
              {/* Card Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Package size={20} color="var(--primary)" />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ORDER ID:</span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F8FAFC', fontFamily: 'monospace' }}>
                      {order.order_number}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {getStatusBadge(order.status)}
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>

              {/* Items List inside Order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={item.image_url}
                      alt={item.product_title}
                      style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', background: '#090D16' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#F8FAFC' }}>{item.product_title}</div>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                        Qty: {item.quantity} • ${item.price.toFixed(2)} each
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F8FAFC' }}>
                      ${item.item_total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#CBD5E1' }}>
                  Total Paid: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>${order.total.toFixed(2)}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px' }}>({order.payment_method})</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {['PLACED', 'PROCESSING'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#FB7185', borderColor: 'rgba(244,63,94,0.3)' }}
                    >
                      Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                  >
                    <Truck size={16} /> Track Shipment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Package size={48} color="#64748B" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No Orders Placed Yet</h2>
          <p style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
            When you complete a purchase, your item shipments and live courier tracking will appear right here.
          </p>
          <Link to="/products" className="btn-primary">Browse Catalog <ArrowRight size={16} /></Link>
        </div>
      )}

      {/* Live Order Tracking Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div
            className="glass-panel"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Courier Telemetry Tracking
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order #{selectedOrder.order_number}</h2>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                Estimated Delivery: <strong style={{ color: '#F8FAFC' }}>{selectedOrder.estimated_delivery || 'In 2 Business Days'}</strong>
              </span>
            </div>

            {/* Timeline Component */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <TrackingTimeline
                timeline={selectedOrder.tracking_timeline}
                currentStatus={selectedOrder.status}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
