import React, { useState } from 'react';
import { X, CreditCard, QrCode, Banknote, ShieldCheck, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

const PaymentModal = ({ totalAmount, onComplete, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState('CARD'); // 'CARD', 'UPI', 'COD'
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('MARCUS VANCE');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [upiId, setUpiId] = useState('marcus@upi');
  const [processing, setProcessing] = useState(false);

  const handleSimulatePayment = (mockResult = 'SUCCESS') => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onComplete({
        paymentMethod: selectedMethod,
        mockStatus: mockResult
      });
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={processing}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Simulated Payment Gateway</h3>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>256-Bit Encrypted Sandbox Checkout</span>
          </div>
        </div>

        {/* Amount Header */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '0.88rem', color: '#94A3B8' }}>Grand Total Payable:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Payment Methods Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setSelectedMethod('CARD')}
            style={{
              padding: '12px 8px',
              borderRadius: '10px',
              border: selectedMethod === 'CARD' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
              background: selectedMethod === 'CARD' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedMethod === 'CARD' ? '#38BDF8' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <CreditCard size={20} />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('UPI')}
            style={{
              padding: '12px 8px',
              borderRadius: '10px',
              border: selectedMethod === 'UPI' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
              background: selectedMethod === 'UPI' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedMethod === 'UPI' ? '#38BDF8' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <QrCode size={20} />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('COD')}
            style={{
              padding: '12px 8px',
              borderRadius: '10px',
              border: selectedMethod === 'COD' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
              background: selectedMethod === 'COD' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedMethod === 'COD' ? '#38BDF8' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <Banknote size={20} />
            <span>Pay on Delivery</span>
          </button>
        </div>

        {/* Selected Method View */}
        {selectedMethod === 'CARD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {/* Holographic Card Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #080B10 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              color: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>LUNA TITANIUM BLACK</span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>DEBIT / CREDIT</span>
              </div>
              <div style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '16px', fontFamily: 'monospace' }}>
                {cardNumber}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: '#64748B', fontSize: '0.65rem' }}>CARD HOLDER</div>
                  <div style={{ fontWeight: 600 }}>{cardHolder}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: '0.65rem' }}>EXPIRES</div>
                  <div style={{ fontWeight: 600 }}>{cardExpiry}</div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', display: 'block' }}>Card Number</label>
              <input type="text" className="input-field" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', display: 'block' }}>Valid Thru</label>
                <input type="text" className="input-field" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '4px', display: 'block' }}>CVV</label>
                <input type="password" maxLength="4" className="input-field" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'UPI' && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-block',
              padding: '16px',
              background: '#fff',
              borderRadius: '16px',
              marginBottom: '14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              {/* Simulated QR Pattern */}
              <div style={{
                width: '160px',
                height: '160px',
                background: 'repeating-conic-gradient(#090D16 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ background: '#090D16', padding: '6px', borderRadius: '6px', color: '#06B6D4', fontSize: '0.75rem', fontWeight: 800 }}>
                  LUNA UPI
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '12px' }}>
              Scan QR code with Google Pay, PhonePe, Paytm or Apple Pay
            </p>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <input type="text" className="input-field" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
            </div>
          </div>
        )}

        {selectedMethod === 'COD' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <Banknote size={32} color="#F59E0B" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#FBBF24', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Cash on Delivery (COD)</h4>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>
              Pay in cash or digital card/UPI at your doorstep upon package arrival with OTP confirmation.
            </p>
          </div>
        )}

        {/* Confirmation Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => handleSimulatePayment('SUCCESS')}
            disabled={processing}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {processing ? 'Authorizing Payment...' : `Confirm & Pay $${totalAmount.toFixed(2)}`}
          </button>

          {/* Test Simulation Buttons (As requested by Prompt) */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', alignSelf: 'center' }}>Test Scenarios:</span>
            <button
              onClick={() => handleSimulatePayment('SUCCESS')}
              disabled={processing}
              style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              [Simulate Success]
            </button>
            <button
              onClick={() => handleSimulatePayment('FAILED')}
              disabled={processing}
              style={{ background: 'none', border: 'none', color: '#F43F5E', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              [Simulate Bank Failure]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
