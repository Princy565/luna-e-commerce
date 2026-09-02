import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingBag, Heart, User as UserIcon, Menu, X, 
  MapPin, Mic, MicOff, ChevronDown, LogOut, Package, 
  ShieldCheck, Sparkles, Tag, Layers, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productApi } from '../api/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [pincode, setPincode] = useState('94016');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState(pincode);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Click outside listener for suggestions & dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await productApi.getSuggestions(searchQuery);
          if (res.success && res.suggestions) {
            setSuggestions(res.suggestions);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsListening(true);
      setTimeout(() => {
        setSearchQuery('Smartwatch');
        setIsListening(false);
        navigate('/products?q=Smartwatch');
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        navigate(`/products?q=${encodeURIComponent(transcript)}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Top Notification / Micro-bar */}
      <div style={{
        background: 'linear-gradient(90deg, #C9DFD5 0%, #EAF5EF 50%, #C9DFD5 100%)',
        borderBottom: '1px solid rgba(142,182,155,0.12)',
        padding: '6px 0',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px', color: 'var(--text-primary)' }}>LUNA 2026</span>
            <span>Next-Gen Spatial & Cyber E-Commerce Experience</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowPincodeModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem'
              }}
            >
              <MapPin size={13} color="var(--primary)" />
              <span>Deliver to: <strong>{pincode}</strong></span>
            </button>
            <Link to="/deals" style={{ color: '#E9C46A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Tag size={12} /> Flash Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'rgba(234, 245, 239, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        boxShadow: '0 8px 32px rgba(3, 18, 19, 0.6)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '20px' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8EB69B 0%, #235347 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--primary-glow)'
            }}>
              <Sparkles size={22} color="#051F20" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #235347 0%, #12352D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1
              }}>
                LUNA
              </div>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                TECH & LUXURY
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div ref={searchRef} style={{ flex: 1, maxWidth: '560px', position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search futuristic audio, wearables, mechanical gear..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.72)',
                  border: '1px solid rgba(142, 182, 155, 0.25)',
                  borderRadius: '999px',
                  padding: '10px 48px 10px 42px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
              <Search
                size={18}
                color="var(--text-secondary)"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: isListening ? '#E07A5F' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Voice Search"
              >
                {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: '#0B2B26',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                zIndex: 1000,
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8EB69B', padding: '6px 12px', textTransform: 'uppercase' }}>
                  Suggested Matches
                </div>
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSuggestions(false);
                      if (item.type === 'product') {
                        navigate(`/products/${item.id}`);
                      } else if (item.type === 'category') {
                        navigate(`/products?category=${item.slug}`);
                      } else {
                        navigate(`/products?brand=${item.name}`);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(142,182,155,0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.image && (
                      <img src={item.image} alt={item.title} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', color: '#DAF1DE', fontWeight: 500 }}>
                        {item.title || item.name}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#8EB69B', textTransform: 'capitalize' }}>
                        {item.type} {item.price ? `• $${item.price.toFixed(2)}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <nav style={{ display: 'none', gap: '20px', alignItems: 'center' }} className="desktop-nav">
              <Link to="/products" style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>Catalog</Link>
              <Link to="/deals" style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>Deals</Link>
            </nav>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)'
              }}
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#F43F5E',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(244,63,94,0.6)'
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38BDF8'
              }}
              title="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {cart.items_count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#06B6D4',
                  color: '#07090E',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(6,182,212,0.6)'
                }}>
                  {cart.items_count}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '999px',
                    padding: '4px 12px 4px 6px',
                    cursor: 'pointer',
                    color: '#F8FAFC'
                  }}
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#94A3B8" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-primary"
                  style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <UserIcon size={16} /> Sign In
                </button>
              )}

              {/* User Dropdown Menu */}
              {user && userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '220px',
                  background: '#0D111A',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  padding: '8px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F8FAFC' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user.email}</div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#38BDF8',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ShieldCheck size={16} /> Admin Center
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#E2E8F0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserIcon size={16} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#E2E8F0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Package size={16} /> Order History
                  </Link>

                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#FB7185',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              className="mobile-only"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Secondary Category Navbar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.72)',
          borderTop: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '44px' }}>
            <Link to="/products" style={{ color: '#087F8C', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> All Categories
            </Link>
            <Link to="/products?category=wearables" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Smart Wearables</Link>
            <Link to="/products?category=audio" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Audio & Acoustics</Link>
            <Link to="/products?category=computing" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Computing</Link>
            <Link to="/products?category=fashion" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Futuristic Fashion</Link>
            <Link to="/products?category=smart-living" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Smart Living</Link>
            <Link to="/products?category=accessories" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>Cyber Accessories</Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#07090E',
          zIndex: 890,
          padding: '24px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>Home</Link>
            <Link to="/products" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>Catalog</Link>
            <Link to="/deals" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FBBF24' }}>Flash Deals</Link>
            <Link to="/wishlist" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>Wishlist ({wishlistCount})</Link>
            <Link to="/cart" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38BDF8' }}>Cart ({cart.items_count})</Link>
            {user ? (
              <>
                <Link to="/profile" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>Profile & Addresses</Link>
                <Link to="/orders" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>Orders</Link>
                {isAdmin && <Link to="/admin" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#06B6D4' }}>Admin Dashboard</Link>}
                <button onClick={logout} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#FB7185', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }} className="btn-primary" style={{ marginTop: '12px' }}>
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pincode / Location Modal */}
      {showPincodeModal && (
        <div className="modal-backdrop">
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Choose Delivery Location</h3>
              <button onClick={() => setShowPincodeModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '16px' }}>
              Enter your Postal/ZIP Code to verify instant delivery availability and express shipping timelines.
            </p>
            <input
              type="text"
              className="input-field"
              value={tempPincode}
              onChange={(e) => setTempPincode(e.target.value)}
              placeholder="e.g. 94016 or 560001"
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  if (tempPincode.trim()) setPincode(tempPincode.trim());
                  setShowPincodeModal(false);
                }}
              >
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
