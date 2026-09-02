import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Clock, Zap, ArrowRight, Copy, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { productApi } from '../api/api';
import { useToast } from '../context/ToastContext';

const Deals = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({ discount_min: 15, limit: 30 });
        if (res.success) setDealProducts(res.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span className="badge badge-amber" style={{ display: 'inline-flex', gap: '6px', marginBottom: '10px' }}>
            <Zap size={14} /> EXCLUSIVE DROPS
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Flash Deals & Clearance
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '520px' }}>
            Limited allocation prototypes and seasonal discounts up to 30% off across LUNA hardware.
          </p>
        </div>

        {/* Coupons Carousel / Grid */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { code: 'LUNA20', desc: '20% OFF Orders > $150' },
            { code: 'WELCOME50', desc: '15% OFF Any Order' },
            { code: 'VIP30', desc: '30% OFF Orders > $400' }
          ].map((c) => (
            <div
              key={c.code}
              onClick={() => copyCouponCode(c.code)}
              style={{
                background: '#090D16',
                border: '1px dashed var(--primary)',
                borderRadius: '12px',
                padding: '12px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1rem' }}>
                  {c.code}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{c.desc}</span>
              </div>
              {copiedCoupon === c.code ? <Check size={16} color="#10B981" /> : <Copy size={16} color="#64748B" />}
            </div>
          ))}
        </div>
      </div>

      {/* Deals Product Grid */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
        Discounted Hardware ({dealProducts.length} items)
      </h2>

      {loading ? (
        <div className="product-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card skeleton" style={{ height: '360px' }} />
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {dealProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(prod) => setQuickViewProduct(prod)}
            />
          ))}
        </div>
      )}

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
};

export default Deals;
