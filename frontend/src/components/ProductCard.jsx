import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isLiked = isInWishlist(product.id);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? '-6px' : '0px'})`,
        transition: isHovered ? 'transform 0.1s ease-out, border-color 0.3s' : 'transform 0.4s ease-out, border-color 0.3s, box-shadow 0.3s',
        overflow: 'hidden'
      }}
    >
      {/* Product Image & Badges */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: '#090D16' }}>
        <Link to={`/products/${product.id}`} style={{ position: 'absolute', inset: 0 }}>
          <img
            src={product.main_image}
            alt={product.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </Link>

        {/* Badges Container */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
          {product.is_flash_deal && (
            <span className="badge badge-amber" style={{ display: 'flex', gap: '4px' }}>
              <Zap size={11} /> Flash Deal
            </span>
          )}
          {product.is_new && <span className="badge badge-cyan">New Release</span>}
          {product.discount_percent > 0 && (
            <span className="badge badge-rose">-{product.discount_percent}%</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: isLiked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(13, 17, 26, 0.8)',
            border: isLiked ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
          title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} color={isLiked ? '#F43F5E' : '#E2E8F0'} fill={isLiked ? '#F43F5E' : 'none'} />
        </button>

        {/* Quick View Button (Desktop Hover overlay) */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: `translateX(-50%) translateY(${isHovered ? '0px' : '40px'})`,
              opacity: isHovered ? 1 : 0,
              transition: 'all 0.25s ease',
              background: 'rgba(7, 9, 14, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#F8FAFC',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              zIndex: 3
            }}
          >
            <Eye size={14} /> Quick View
          </button>
        )}
      </div>

      {/* Card Info Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              {product.brand}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', color: '#FBBF24' }}>
              <Star size={13} fill="#FBBF24" />
              <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{product.rating}</span>
              <span style={{ color: '#64748B', fontSize: '0.72rem' }}>({product.review_count})</span>
            </div>
          </div>

          <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#F8FAFC',
              lineHeight: 1.4,
              marginBottom: '10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em'
            }}>
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing and Add to Bag */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
              ${product.price.toFixed(2)}
            </span>
            {product.original_price > product.price && (
              <span style={{ fontSize: '0.85rem', color: '#64748B', textDecoration: 'line-through' }}>
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={product.stock <= 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '8px 14px',
              fontSize: '0.85rem',
              opacity: product.stock <= 0 ? 0.5 : 1,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingBag size={16} />
            {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
