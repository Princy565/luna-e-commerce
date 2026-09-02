import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { isAuthModalOpen, authModalTab, setAuthModalTab, closeAuthModal, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@luna.com');
      setPassword('admin123');
    } else {
      setEmail('user@luna.com');
      setPassword('user123');
    }
    setAuthModalTab('login');
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8EB69B 0%, #235347 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <Sparkles size={24} color="#051F20" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {authModalTab === 'login' ? 'Welcome to LUNA' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#8EB69B', marginTop: '4px' }}>
            {authModalTab === 'login' ? 'Access your futuristic orders, wishlist and cloud cart' : 'Join the next era of industrial design & technology'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setAuthModalTab('login')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authModalTab === 'login' ? 'rgba(142, 182, 155, 0.25)' : 'transparent',
              color: authModalTab === 'login' ? '#DAF1DE' : '#8EB69B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalTab('register')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authModalTab === 'register' ? 'rgba(142, 182, 155, 0.25)' : 'transparent',
              color: authModalTab === 'register' ? '#DAF1DE' : '#8EB69B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {authModalTab === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <User size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {authModalTab === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Phone size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
              />
              <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '10px' }}
          >
            {submitting ? 'Processing...' : (authModalTab === 'login' ? 'Sign In to LUNA' : 'Create Account')}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(6, 182, 212, 0.05)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', marginBottom: '8px', textTransform: 'uppercase' }}>
            Instant Evaluation Demo Accounts
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('customer')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Demo Customer (user@luna.com)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px', borderColor: 'rgba(139,92,246,0.3)', color: '#A78BFA' }}
            >
              <Shield size={12} /> Admin (admin@luna.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
