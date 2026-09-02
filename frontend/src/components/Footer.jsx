import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Lock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      addToast('Thank you for subscribing to LUNA insider releases!', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: '80px',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Trust & Guarantee Banner */}
      <div style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '36px 0',
        background: 'var(--bg-secondary)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.12)', color: 'var(--primary)' }}>
                <Truck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Express Global Delivery</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Free shipping on orders over $999</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(142, 182, 155, 0.12)', color: 'var(--primary)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>2-Year Comprehensive Warranty</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>100% Genuine LUNA hardware</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(35, 83, 71, 0.35)', color: 'var(--primary)' }}>
                <RotateCcw size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>30-Day Hassle-Free Returns</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Instant refund upon verification</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(35, 83, 71, 0.35)', color: 'var(--primary)' }}>
                <Lock size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>End-to-End Secure Payments</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Encrypted 256-bit checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container" style={{ padding: '60px 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--secondary) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} color="#07090E" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                LUNA
              </span>
            </Link>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Pioneering next-generation industrial design, biometric wearables, and studio-grade acoustics. Engineered for visionary lifestyles.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} LUNA Technologies Inc. All rights reserved.
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Collections</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/products?category=wearables" style={{ transition: 'color 0.2s' }}>Biometric Smartwatches</Link></li>
              <li><Link to="/products?category=audio" style={{ transition: 'color 0.2s' }}>Planar Magnetic Audio</Link></li>
              <li><Link to="/products?category=computing" style={{ transition: 'color 0.2s' }}>Hall-Effect Keyboards</Link></li>
              <li><Link to="/products?category=fashion" style={{ transition: 'color 0.2s' }}>Waterproof Techwear</Link></li>
              <li><Link to="/products?category=accessories" style={{ transition: 'color 0.2s' }}>Cyber EDC & Powerbanks</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Client Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/orders">Track Your Shipment</Link></li>
              <li><Link to="/profile">Returns & Exchanges</Link></li>
              <li><Link to="/deals">Exclusive Drops</Link></li>
              <li><a href="#support" onClick={(e) => { e.preventDefault(); alert('LUNA 24/7 Concierge Support is active. Email: support@luna.com'); }}>Support Concierge</a></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>LUNA Early Access</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Be the first to experience private prototype releases and member-only 20% vouchers.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.8rem', marginTop: '8px' }}>
                <CheckCircle2 size={14} /> Subscribed to LUNA Insider.
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
