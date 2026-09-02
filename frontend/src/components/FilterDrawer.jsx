import React from 'react';
import { X, RotateCcw, Filter, Star, Check } from 'lucide-react';

const FilterDrawer = ({
  categories = [],
  brands = [],
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  discountMin,
  setDiscountMin,
  inStockOnly,
  setInStockOnly,
  onClearFilters,
  isOpenMobile,
  onCloseMobile
}) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header / Clear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
          <Filter size={18} color="var(--primary)" /> Filter Catalog
        </div>
        <button
          onClick={onClearFilters}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={12} /> Reset All
        </button>
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              textAlign: 'left',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: selectedCategory === 'all' || !selectedCategory ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: selectedCategory === 'all' || !selectedCategory ? '#38BDF8' : '#94A3B8',
              fontSize: '0.85rem',
              fontWeight: selectedCategory === 'all' || !selectedCategory ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedCategory === c.slug ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: selectedCategory === c.slug ? '#38BDF8' : '#94A3B8',
                fontSize: '0.85rem',
                fontWeight: selectedCategory === c.slug ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{c.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.product_count || ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Max Price
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
            ${priceRange}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="800"
          step="25"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
          <span>$50</span>
          <span>$800+</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Brand
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => setSelectedBrand('all')}
            style={{
              textAlign: 'left',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: selectedBrand === 'all' || !selectedBrand ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: selectedBrand === 'all' || !selectedBrand ? '#38BDF8' : '#94A3B8',
              fontSize: '0.85rem',
              fontWeight: selectedBrand === 'all' || !selectedBrand ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.name)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedBrand === b.name ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: selectedBrand === b.name ? '#38BDF8' : '#94A3B8',
                fontSize: '0.85rem',
                fontWeight: selectedBrand === b.name ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Customer Rating
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[4.5, 4.0, 3.5].map((stars) => (
            <button
              key={stars}
              onClick={() => setMinRating(minRating === stars ? null : stars)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: minRating === stars ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: minRating === stars ? '#FBBF24' : '#94A3B8',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FBBF24' }}>
                <Star size={14} fill="#FBBF24" />
                <span style={{ fontWeight: 600 }}>{stars}</span>
              </div>
              <span>& above</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount Minimum */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Special Deals
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[10, 20, 25].map((d) => (
            <button
              key={d}
              onClick={() => setDiscountMin(discountMin === d ? null : d)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: discountMin === d ? '1px solid #F43F5E' : '1px solid rgba(255,255,255,0.1)',
                background: discountMin === d ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.04)',
                color: discountMin === d ? '#FB7185' : '#94A3B8',
                cursor: 'pointer'
              }}
            >
              {d}%+ Off
            </button>
          ))}
        </div>
      </div>

      {/* Stock Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>In Stock Only</span>
        <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            inset: 0,
            backgroundColor: inStockOnly ? 'var(--primary)' : '#1E293B',
            borderRadius: '24px',
            transition: '0.3s'
          }}>
            <span style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: inStockOnly ? '20px' : '3px',
              bottom: '3px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              transition: '0.3s'
            }} />
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter */}
      <aside className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
        {content}
      </aside>

      {/* Mobile Drawer Modal */}
      {isOpenMobile && (
        <div className="modal-backdrop" onClick={onCloseMobile}>
          <div
            className="glass-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '360px',
              height: '100%',
              padding: '24px',
              overflowY: 'auto',
              borderRadius: 0,
              borderLeft: '1px solid var(--border-glass)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button onClick={onCloseMobile} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterDrawer;
