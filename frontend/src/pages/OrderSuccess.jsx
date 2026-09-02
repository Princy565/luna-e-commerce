import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Truck, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderApi } from '../api/api';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B']
      });
    } catch (err) {}

    if (!order && orderNumber) {
      orderApi.getOrderByNumber(orderNumber)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderNumber, order]);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '780px' }}>
      
      <div className="glass-panel" style={{ padding: '48px 36px', textAlign: 'center' }}>
        
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#10B981',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle2 size={44} />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
          Payment & Order Confirmed!
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '24px' }}>
          Thank you for choosing LUNA. Your order has been registered and is being prepared for express courier dispatch.
        </p>

        {/* Order Number Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#090D16',
          border: '1px solid var(--border-glass)',
          padding: '10px 20px',
          borderRadius: '999px',
          marginBottom: '36px'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Order Reference:</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
            {orderNumber || order?.order_number}
          </span>
        </div>

        {/* Details Grid */}
        {order && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '36px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#F8FAFC' }}>
              Order Snapshot
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Estimated Delivery</span>
                <div style={{ fontWeight: 600, color: '#F8FAFC', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="var(--primary)" /> {order.estimated_delivery || 'In 2 business days'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Payment Method</span>
                <div style={{ fontWeight: 600, color: '#F8FAFC', marginTop: '2px' }}>
                  {order.payment_method} ({order.payment_status})
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Total Amount Paid</span>
                <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                  ${order.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Purchased Products ({order.items?.length || 0})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: '#E2E8F0' }}>{item.product_title} × {item.quantity}</span>
                    <span style={{ fontWeight: 700, color: '#F8FAFC' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-primary" style={{ padding: '12px 28px' }}>
            <Package size={18} /> View Live Tracking Timeline
          </Link>
          <Link to="/products" className="btn-secondary" style={{ padding: '12px 24px' }}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default OrderSuccess;
