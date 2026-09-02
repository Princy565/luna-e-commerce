import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Zap, Shield, Flame, 
  Clock, Award, ChevronRight, Layers, ArrowUpRight 
} from 'lucide-react';
import ThreeHeroViewer from '../components/ThreeHeroViewer';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { productApi } from '../api/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 48, seconds: 12 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, trendRes, dealRes, catRes] = await Promise.all([
          productApi.getProducts({ featured: 'true', limit: 4 }),
          productApi.getProducts({ trending: 'true', limit: 4 }),
          productApi.getProducts({ flash_deal: 'true', limit: 4 }),
          productApi.getCategories()
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products);
        if (trendRes.success) setTrendingProducts(trendRes.products);
        if (dealRes.success) setFlashDeals(dealRes.products);
        if (catRes.success) setCategories(catRes.categories);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Flash Deal Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '40px' }}>
      
      {/* 1. Hero Section with 3D Canvas */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '20px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '40px',
            minHeight: '520px',
            padding: '40px 0'
          }}>
            {/* Left Headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> ARCHITECTURE 2026
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aerospace Grade Engineering</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: '-0.03em'
              }}>
                The Future of <br />
                <span style={{
                  background: 'linear-gradient(135deg, #DAF1DE 0%, #8EB69B 60%, #235347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Hyper-Sensory
                </span> Hardware.
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6 }}>
                Step into LUNA. Discover biometric smartwatches, lossless acoustic monoliths, and cyber accessories engineered for zero compromise.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
                <Link to="/products" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '0.95rem' }}>
                  Explore Collection <ArrowRight size={18} />
                </Link>
                <Link to="/deals" className="btn-secondary" style={{ padding: '0.9rem 1.8rem', fontSize: '0.95rem' }}>
                  Flash Drops <Zap size={16} color="#FBBF24" />
                </Link>
              </div>

              {/* Trust Metric Micro-pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="var(--primary)" /> 2-Yr Global Warranty
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#8B5CF6" /> RedDot Design 2026
                </div>
              </div>
            </div>

            {/* Right 3D Interactive Canvas Viewer */}
            <div style={{
              height: '480px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ThreeHeroViewer modelType="cyber_watch" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Row */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Curated Worlds
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Explore by Category</h2>
          </div>
          <Link to="/products" style={{ fontSize: '0.88rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="glass-card"
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>{cat.name}</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{cat.product_count} Products</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Deals Banner with Live Countdown Timer */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '28px'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                <Flame size={18} /> LIMITED TIME DROP
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Flash Deals & Prototype Drops</h2>
            </div>

            {/* Countdown Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#FBBF24" />
              <span style={{ fontSize: '0.85rem', color: '#CBD5E1', marginRight: '4px' }}>Ends in:</span>
              <div style={{ display: 'flex', gap: '6px', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>
                <span style={{ background: '#090D16', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span style={{ background: '#090D16', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span style={{ background: '#090D16', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#F43F5E' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Flash Deals Grid */}
          <div className="product-grid">
            {flashDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Hardware Grid */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Community Favorites
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Trending This Week</h2>
          </div>
          <Link to="/products?trending=true" style={{ fontSize: '0.88rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            See All Trending <ChevronRight size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {trendingProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. Promotional Futuristic Feature Banner */}
      <section className="container">
        <div style={{
          background: 'radial-gradient(ellipse at center, rgba(142,182,155,0.18) 0%, rgba(11,43,38,0.95) 100%)',
          border: '1px solid var(--border-glass)',
          borderRadius: '24px',
          padding: '60px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          alignItems: 'center',
          gap: '40px'
        }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '14px' }}>LUNA ECOSYSTEM</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Crafted in Titanium. <br />Powered by Neural Telemetry.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '24px' }}>
              Every product in the LUNA line passes through 48-point aerospace acoustic & biometric calibration. Experience the purest fusion of tactile luxury and bleeding-edge digital precision.
            </p>
            <Link to="/products?category=wearables" className="btn-primary">
              Discover Smart Wearables <ArrowUpRight size={18} />
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
              alt="LUNA Titanium Preview"
              style={{
                maxWidth: '85%',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px var(--primary-glow)',
                filter: 'brightness(1.05)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
};

export default Home;
