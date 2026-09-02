import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, 
  Check, Share2, Sparkles, Box, CheckCircle2, MessageSquarePlus 
} from 'lucide-react';
import ThreeHeroViewer from '../components/ThreeHeroViewer';
import ProductCard from '../components/ProductCard';
import { productApi, reviewApi } from '../api/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], breakdown: {}, average_rating: 5, total_reviews: 0 });
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or '3d'
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Pincode test
  const [checkPincode, setCheckPincode] = useState('94016');
  const [pincodeVerified, setPincodeVerified] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await productApi.getProductById(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.main_image);
          setSelectedColor(res.product.colors?.[0] || null);
          setSelectedSize(res.product.sizes?.[0] || null);
          setRelatedProducts(res.related_products || []);
          setFrequentlyBought(res.frequently_bought_together || []);

          // Fetch reviews
          const revRes = await reviewApi.getProductReviews(id);
          if (revRes.success) {
            setReviewsData(revRes);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
          <div className="skeleton" style={{ height: '480px', borderRadius: '16px' }} />
          <div>
            <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '120px', width: '100%', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Product Not Found</h2>
        <p style={{ color: '#94A3B8', marginBottom: '24px' }}>The product you are looking for does not exist or has been retired.</p>
        <Link to="/products" className="btn-primary">Browse All Hardware</Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const images = product.images || [product.main_image];

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await reviewApi.addReview({
        product_id: product.id,
        rating: newRating,
        title: reviewTitle,
        comment: reviewComment
      });
      if (res.success) {
        addToast('Review submitted successfully!', 'success');
        setShowReviewForm(false);
        setReviewTitle('');
        setReviewComment('');
        // Refresh reviews
        const revRes = await reviewApi.getProductReviews(product.id);
        if (revRes.success) setReviewsData(revRes);
      }
    } catch (err) {
      addToast(err.message || 'Could not post review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '80px' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94A3B8' }}>Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_slug}`} style={{ color: '#94A3B8', textTransform: 'capitalize' }}>
          {product.category}
        </Link>
        <span>/</span>
        <span style={{ color: '#F8FAFC' }}>{product.title}</span>
      </div>

      {/* Main Product Showcase Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '48px',
        alignItems: 'start',
        marginBottom: '60px'
      }}>
        
        {/* Left Column: Interactive 3D & Gallery */}
        <div>
          {/* Toggle View Mode Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              onClick={() => setViewMode('gallery')}
              style={{
                background: viewMode === 'gallery' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                border: viewMode === 'gallery' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                color: viewMode === 'gallery' ? '#38BDF8' : '#94A3B8',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Photo Gallery
            </button>
            <button
              onClick={() => setViewMode('3d')}
              style={{
                background: viewMode === '3d' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                border: viewMode === '3d' ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                color: viewMode === '3d' ? '#A78BFA' : '#94A3B8',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Box size={14} /> Interactive 3D Model
            </button>
          </div>

          {/* Viewer Container */}
          <div style={{
            background: '#090D16',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
          }}>
            {viewMode === '3d' ? (
              <ThreeHeroViewer modelType={product.three_d_model || 'cyber_watch'} />
            ) : (
              <img
                src={selectedImage || product.main_image}
                alt={product.title}
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))',
                  transition: 'transform 0.3s ease'
                }}
              />
            )}
          </div>

          {/* Thumbnails Row */}
          {viewMode === 'gallery' && images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '10px',
                    border: selectedImage === img ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: '#090D16',
                    padding: '4px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information, Variants & Actions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.06em' }}>
              {product.brand}
            </span>
            <button
              onClick={handleShare}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.82rem'
              }}
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '14px' }}>
            {product.title}
          </h1>

          {/* Rating Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Star size={14} fill="#FBBF24" color="#FBBF24" />
              <span style={{ fontWeight: 800, color: '#FBBF24', fontSize: '0.88rem' }}>{product.rating}</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              ({reviewsData.total_reviews || product.review_count} client reviews)
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: product.stock > 0 ? '#10B981' : '#F43F5E', fontWeight: 600 }}>
              {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Pricing Box */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.original_price > product.price && (
                <span style={{ fontSize: '1.2rem', color: '#64748B', textDecoration: 'line-through' }}>
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge badge-rose" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  Save {product.discount_percent}%
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Includes applicable taxes. Free express shipping on orders over $999.
            </p>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '10px' }}>
                Select Color:
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: selectedColor === c ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: selectedColor === c ? '0 0 12px var(--primary-glow)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {selectedColor === c && <Check size={16} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size / Variant Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '10px' }}>
                Select Variant / Specification:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
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

          {/* Quantity and Primary Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {/* Quantity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              padding: '6px'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '36px', height: '36px', background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                -
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{ width: '36px', height: '36px', background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                +
              </button>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary"
              style={{ flex: 1, minWidth: '160px', padding: '12px 24px' }}
            >
              <ShoppingBag size={18} /> Add to Bag
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="btn-secondary"
              style={{ padding: '12px 24px', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#38BDF8' }}
            >
              Buy Now
            </button>

            {/* Wishlist */}
            <button
              onClick={() => toggleWishlist(product)}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: isLiked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.06)',
                border: isLiked ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
                color: isLiked ? '#F43F5E' : '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Save to wishlist"
            >
              <Heart size={22} fill={isLiked ? '#F43F5E' : 'none'} />
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div style={{
            background: 'rgba(13, 17, 26, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
              <Truck size={16} color="var(--primary)" /> Delivery Availability
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                value={checkPincode}
                onChange={(e) => setCheckPincode(e.target.value)}
                placeholder="Enter Postal Code"
                style={{ maxWidth: '180px', padding: '6px 12px', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => setPincodeVerified(true)}
              >
                Check
              </button>
            </div>
            {pincodeVerified && (
              <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Express 2-Day Courier Available to <strong>{checkPincode}</strong>.
              </div>
            )}
          </div>

          {/* Value Props */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary)" /> 24-Month LUNA Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="#8B5CF6" /> 30 Days Free Return
            </div>
          </div>
        </div>

      </div>

      {/* Technical Specifications Section */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="glass-panel" style={{ padding: '36px', marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
            Technical Architecture & Specifications
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {Object.entries(product.specs).map(([key, val], idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  {key}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#F8FAFC', fontWeight: 500 }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Feedback */}
      <section className="glass-panel" style={{ padding: '36px', marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>
              Client Verification & Reviews
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {reviewsData.total_reviews} verified purchaser ratings
            </span>
          </div>

          <button
            onClick={() => {
              if (!user) openAuthModal('login');
              else setShowReviewForm(!showReviewForm);
            }}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <MessageSquarePlus size={16} /> Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} style={{
            background: 'rgba(13, 17, 26, 0.8)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Write Your Verified Review</h4>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Overall Rating</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={24} fill={s <= newRating ? '#FBBF24' : 'none'} color={s <= newRating ? '#FBBF24' : '#64748B'} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Headline / Title</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Masterclass in industrial design"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Your Detailed Experience</label>
              <textarea
                required
                rows="4"
                className="input-field"
                placeholder="Share your thoughts on build quality, audio performance, or telemetry accuracy..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={submittingReview} className="btn-primary">
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
            reviewsData.reviews.map((rev) => (
              <div key={rev.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {rev.user_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC' }}>{rev.user_name}</div>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={11} /> Verified Buyer
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', color: '#FBBF24' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? '#FBBF24' : 'none'} color={i < rev.rating ? '#FBBF24' : '#475569'} />
                    ))}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#E2E8F0', marginBottom: '6px' }}>
                  {rev.title}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '0.9rem' }}>
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
            Complementary Hardware
          </h3>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
