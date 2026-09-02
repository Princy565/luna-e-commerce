import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '120px 20px 140px' }}>
      <div style={{
        fontSize: '6rem',
        fontWeight: 900,
        fontFamily: 'var(--font-heading)',
        background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1
      }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '16px 0 8px' }}>
        Telemetry Signal Lost
      </h1>
      <p style={{ color: '#94A3B8', maxWidth: '440px', margin: '0 auto 28px', fontSize: '0.95rem' }}>
        The coordinates you requested do not exist in the LUNA ecosystem or have migrated to another sector.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link to="/" className="btn-primary">
          <Home size={16} /> Return to Home
        </Link>
        <Link to="/products" className="btn-secondary">
          <ArrowLeft size={16} /> Browse Catalog
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
