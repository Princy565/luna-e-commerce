import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, XCircle } from 'lucide-react';

const TrackingTimeline = ({ timeline = [], currentStatus = 'PLACED' }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'PLACED': return Package;
      case 'PROCESSING': return Clock;
      case 'SHIPPED': return Truck;
      case 'OUT_FOR_DELIVERY': return Truck;
      case 'DELIVERED': return Home;
      case 'CANCELLED': return XCircle;
      default: return CheckCircle2;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative', paddingLeft: '12px' }}>
      {timeline.map((step, idx) => {
        const Icon = getIcon(step.status);
        const isCancelled = step.status === 'CANCELLED';
        const isLast = idx === timeline.length - 1;

        let iconBg = '#1E293B';
        let iconColor = '#64748B';
        let borderColor = 'rgba(255,255,255,0.1)';

        if (isCancelled) {
          iconBg = 'rgba(244, 63, 94, 0.2)';
          iconColor = '#F43F5E';
          borderColor = '#F43F5E';
        } else if (step.completed) {
          iconBg = step.current ? 'var(--primary)' : 'rgba(16, 185, 129, 0.2)';
          iconColor = step.current ? '#07090E' : '#10B981';
          borderColor = step.current ? 'var(--primary)' : '#10B981';
        }

        return (
          <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: isLast ? '0px' : '24px' }}>
            {/* Connecting Vertical Line */}
            {!isLast && (
              <div style={{
                position: 'absolute',
                left: '17px',
                top: '36px',
                bottom: '0px',
                width: '2px',
                background: step.completed && !step.current ? '#10B981' : 'rgba(255,255,255,0.08)'
              }} />
            )}

            {/* Step Icon Node */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: iconBg,
              border: `2px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
              zIndex: 2,
              boxShadow: step.current ? '0 0 15px var(--primary-glow)' : 'none'
            }}>
              <Icon size={18} />
            </div>

            {/* Step Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: step.current ? 800 : (step.completed ? 600 : 400),
                  color: isCancelled ? '#F43F5E' : (step.completed ? '#F8FAFC' : '#64748B')
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: step.current ? 'var(--primary)' : '#64748B', fontWeight: 500 }}>
                  {step.time}
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: step.completed ? '#94A3B8' : '#475569', marginTop: '2px' }}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
