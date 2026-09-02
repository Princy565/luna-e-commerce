import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Truck, CreditCard, CheckCircle2, ShieldCheck, 
  Plus, ChevronRight, Lock, ArrowLeft, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { authApi, orderApi } from '../api/api';
import PaymentModal from '../components/PaymentModal';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, appliedCoupon, refreshCart } = useCart();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Delivery, 3: Review & Pay
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('EXPRESS'); // 'STANDARD', 'EXPRESS', 'PRIORITY'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // New Address Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/cart');
      return;
    }
    const loadAddresses = async () => {
      try {
        const res = await authApi.getAddresses();
        if (res.success && res.addresses.length > 0) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadAddresses();
  }, [user, navigate]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.addAddress({
        full_name: fullName,
        phone,
        street,
        city,
        state,
        postal_code: postalCode,
        is_default: isDefault
      });
      if (res.success && res.address) {
        setAddresses((prev) => [res.address, ...prev]);
        setSelectedAddressId(res.address.id);
        setShowAddressModal(false);
        addToast('Shipping address added', 'success');
        // Reset
        setFullName(''); setPhone(''); setStreet(''); setCity(''); setState(''); setPostalCode('');
      }
    } catch (err) {
      addToast(err.message || 'Could not save address', 'error');
    }
  };

  const handleExecutePaymentAndOrder = async ({ paymentMethod, mockStatus }) => {
    setShowPaymentModal(false);
    setSubmittingOrder(true);
    try {
      const res = await orderApi.checkout({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon || undefined,
        mock_payment_status: mockStatus
      });

      if (res.success && res.order) {
        addToast('Order placed successfully!', 'success');
        refreshCart();
        navigate(`/order-success/${res.order.order_number}`, { state: { order: res.order } });
      }
    } catch (err) {
      addToast(err.message || 'Order placement failed', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>No items in bag for checkout</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '16px' }}>Return to Catalog</Link>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '1080px' }}>
      
      {/* Checkout Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '600px', width: '100%' }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 1 ? 'var(--primary)' : '#1E293B',
              color: currentStep >= 1 ? '#07090E' : '#94A3B8',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}>
              1
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= 1 ? '#F8FAFC' : '#64748B' }}>Shipping</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: currentStep >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 2 ? 'var(--primary)' : '#1E293B',
              color: currentStep >= 2 ? '#07090E' : '#94A3B8',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}>
              2
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= 2 ? '#F8FAFC' : '#64748B' }}>Delivery</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: currentStep >= 3 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 3 ? 'var(--primary)' : '#1E293B',
              color: currentStep >= 3 ? '#07090E' : '#94A3B8',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}>
              3
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentStep >= 3 ? '#F8FAFC' : '#64748B' }}>Review & Pay</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* Step Content Container */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          
          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Select Shipping Address</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                  <MapPin size={36} color="var(--primary)" style={{ marginBottom: '10px' }} />
                  <p>No saved addresses found. Please add a shipping destination.</p>
                  <button onClick={() => setShowAddressModal(true)} className="btn-primary" style={{ marginTop: '14px' }}>
                    Create First Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: selectedAddressId === addr.id ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>
                          {addr.full_name} <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 400 }}>({addr.phone})</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                        </div>
                      </div>
                      {selectedAddressId === addr.id && <CheckCircle2 size={20} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedAddressId}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Continue to Delivery Method <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: DELIVERY SPEED */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Choose Delivery Speed</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                <div
                  onClick={() => setShippingMethod('EXPRESS')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: shippingMethod === 'EXPRESS' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: shippingMethod === 'EXPRESS' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Truck size={22} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC' }}>LUNA Express Global Air (Recommended)</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Delivery in 2 business days • Tracking Included</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>{cart.shipping_fee === 0 ? 'FREE' : `$${cart.shipping_fee}`}</span>
                </div>

                <div
                  onClick={() => setShippingMethod('STANDARD')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: shippingMethod === 'STANDARD' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: shippingMethod === 'STANDARD' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Truck size={22} color="#94A3B8" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC' }}>Standard Surface Shipping</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Delivery in 4-6 business days</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#94A3B8' }}>FREE</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setCurrentStep(1)} className="btn-secondary" style={{ flex: 1 }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => setCurrentStep(3)} className="btn-primary" style={{ flex: 2 }}>
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PAYMENT TRIGGER */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Review & Complete Order</h2>

              {/* Selected Destination Summary */}
              {selectedAddress && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                    Delivering To:
                  </div>
                  <div style={{ fontWeight: 700 }}>{selectedAddress.full_name} ({selectedAddress.phone})</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ShieldCheck size={28} color="#10B981" />
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                  Simulated sandbox environment. Choose Card, UPI QR, or Cash on Delivery in the next step.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setCurrentStep(2)} className="btn-secondary" style={{ flex: 1 }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={submittingOrder}
                  className="btn-primary"
                  style={{ flex: 2, padding: '14px' }}
                >
                  <Lock size={18} /> Launch Payment Gateway (${cart.total.toFixed(2)})
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary Column */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Order Overview</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={item.product?.main_image}
                  alt=""
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: '#090D16' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>{item.product?.title}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Qty: {item.quantity}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ color: '#F8FAFC' }}>${cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                <span>Discount</span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ color: cart.shipping_fee === 0 ? '#10B981' : '#F8FAFC' }}>
                {cart.shipping_fee === 0 ? 'FREE' : `$${cart.shipping_fee.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tax (8%)</span>
              <span style={{ color: '#F8FAFC' }}>${cart.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Address Creator Modal */}
      {showAddressModal && (
        <div className="modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Add New Shipping Address</h3>
            <form onSubmit={handleCreateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input required className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Marcus Vance" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input required className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Street Address</label>
                <input required className="input-field" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Flat / House / Street" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>City</label>
                  <input required className="input-field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>State</label>
                  <input required className="input-field" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>Postal / ZIP Code</label>
                <input required className="input-field" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="94016" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save & Select</button>
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateway Simulation Modal */}
      {showPaymentModal && (
        <PaymentModal
          totalAmount={cart.total}
          onComplete={handleExecutePaymentAndOrder}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

    </div>
  );
};

export default Checkout;
