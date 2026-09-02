import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product?.main_image);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const images = product.images || [product.main_image];
  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedColor, selectedSize);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(13, 17, 26, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Gallery Column */}
        <div style={{ padding: '24px', background: '#090D16', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0D111A' }}>
            <img
              src={selectedImage || product.main_image}
              alt={product.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
              {product.brand}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', lineHeight: 1.3 }}>
              {product.title}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FBBF24' }}>
                <Star size={16} fill="#FBBF24" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F8FAFC' }}>{product.rating}</span>
              </div>
              <span style={{ color: '#64748B', fontSize: '0.85rem' }}>({product.review_count} verified reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.original_price > product.price && (
                <span style={{ fontSize: '1rem', color: '#64748B', textDecoration: 'line-through' }}>
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge badge-rose">Save {product.discount_percent}%</span>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
                  Color Choice
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: selectedColor === c ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: selectedColor === c ? '0 0 10px rgba(56, 189, 248, 0.6)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {selectedColor === c && <Check size={14} color="#fff" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
                  Variant / Size
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: selectedSize === s ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedSize === s ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.04)',
                        color: selectedSize === s ? '#38BDF8' : '#CBD5E1',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              {/* Quantity */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '4px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '32px', height: '32px', background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ width: '30px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ width: '32px', height: '32px', background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1 }}>
                <ShoppingBag size={18} /> Add to Bag
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '46px',
                  borderRadius: '12px',
                  background: isLiked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.06)',
                  border: isLiked ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
                  color: isLiked ? '#F43F5E' : '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Heart size={20} fill={isLiked ? '#F43F5E' : 'none'} />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 600,
                marginTop: '8px'
              }}
            >
              View Full 3D Interactive Details & Specs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
