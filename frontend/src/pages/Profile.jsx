import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, MapPin, Plus, Trash2, 
  CheckCircle2, Shield, Package, Heart, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, reloadUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'addresses'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    loadAddresses();
  }, [user, navigate]);

  const loadAddresses = async () => {
    try {
      const res = await authApi.getAddresses();
      if (res.success) setAddresses(res.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const payload = { name, phone };
      if (newPassword) payload.password = newPassword;

      const res = await authApi.updateProfile(payload);
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        setNewPassword('');
        reloadUser();
      }
    } catch (err) {
      addToast(err.message || 'Profile update failed', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.addAddress({
        full_name: addrFullName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        postal_code: addrPostalCode,
        is_default: addresses.length === 0
      });
      if (res.success) {
        addToast('Address added successfully', 'success');
        setShowAddressForm(false);
        setAddrFullName(''); setAddrPhone(''); setAddrStreet(''); setAddrCity(''); setAddrState(''); setAddrPostalCode('');
        loadAddresses();
      }
    } catch (err) {
      addToast(err.message || 'Could not add address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authApi.deleteAddress(id);
      addToast('Address removed', 'info');
      loadAddresses();
    } catch (err) {
      addToast(err.message || 'Could not delete address', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '1000px' }}>
      
      {/* Profile Header Card */}
      <div className="glass-panel" style={{
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
            alt={user.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user.name}</h1>
              {user.role === 'admin' && (
                <span className="badge badge-purple" style={{ display: 'flex', gap: '4px' }}>
                  <Shield size={12} /> Administrator
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>{user.email}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/orders" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <Package size={16} /> My Orders
          </Link>
          <button onClick={logout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#FB7185', borderColor: 'rgba(244,63,94,0.3)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: activeTab === 'info' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'info' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'info' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Personal Information
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: activeTab === 'addresses' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'addresses' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'addresses' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Saved Addresses ({addresses.length})
        </button>
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'info' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Account Settings</h2>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '520px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input type="email" className="input-field" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Email cannot be changed directly</span>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>Phone Number</label>
              <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>New Password (Leave blank to keep unchanged)</label>
              <input type="password" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
            </div>

            <button type="submit" disabled={updatingProfile} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Manage Delivery Addresses</h2>
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {/* New Address Form Modal/Inline */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} style={{
              background: 'rgba(13, 17, 26, 0.9)',
              border: '1px solid var(--border-glass)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>New Shipping Destination</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Contact Name</label>
                  <input required className="input-field" value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Phone</label>
                  <input required className="input-field" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Street Address</label>
                <input required className="input-field" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>City</label>
                  <input required className="input-field" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>State</label>
                  <input required className="input-field" value={addrState} onChange={(e) => setAddrState(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Postal Code</label>
                  <input required className="input-field" value={addrPostalCode} onChange={(e) => setAddrPostalCode(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Address</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {/* Address Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{addr.full_name}</span>
                    {addr.is_default && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Default</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '8px' }}>
                    {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                  </p>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Phone: {addr.phone}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
