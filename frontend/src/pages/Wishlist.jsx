import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const { wishlistItems, toggleWishlist, moveToCart } = useWishlist();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#F43F5E'
        }}>
          <Heart size={36} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Save Your Favorite Cyber Hardware</h2>
        <p style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
          Please sign in to keep your personal wishlist preserved across all your sessions.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn-primary" style={{ padding: '12px 32px' }}>
          Sign In to Wishlist
        </button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#64748B'
        }}>
          <Heart size={36} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
          Tap the heart icon on any product to bookmark it for later review or instant purchasing.
        </p>
        <Link to="/products" className="btn-primary" style={{ padding: '12px 32px' }}>
          Explore Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '28px' }}>
        My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="product-grid">
        {wishlistItems.map((item) => {
          const prod = item.product;
          if (!prod) return null;
          return (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#090D16' }}>
                <Link to={`/products/${prod.id}`} style={{ position: 'absolute', inset: 0 }}>
                  <img src={prod.main_image} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                <button
                  onClick={() => toggleWishlist(prod)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(244, 63, 94, 0.2)',
                    border: '1px solid #F43F5E',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} color="#F43F5E" />
                </button>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
                    {prod.brand}
                  </span>
                  <Link to={`/products/${prod.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC', margin: '4px 0 10px', lineHeight: 1.4 }}>
                      {prod.title}
                    </h3>
                  </Link>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '14px' }}>
                    ${prod.price.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => moveToCart(prod.id)}
                  disabled={prod.stock <= 0}
                  className="btn-primary"
                  style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                >
                  <ShoppingBag size={16} /> Move to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
