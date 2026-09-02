import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, SearchX, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterDrawer from '../components/FilterDrawer';
import QuickViewModal from '../components/QuickViewModal';
import { productApi } from '../api/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const categoryParam = searchParams.get('category') || 'all';
  const brandParam = searchParams.get('brand') || 'all';
  const searchParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const [priceRange, setPriceRange] = useState(800);
  const [minRating, setMinRating] = useState(null);
  const [discountMin, setDiscountMin] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Load Categories & Brands
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          productApi.getCategories(),
          productApi.getBrands()
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (brandRes.success) setBrands(brandRes.brands);
      } catch (err) {
        console.error(err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Products based on filters
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: categoryParam !== 'all' ? categoryParam : undefined,
        brand: brandParam !== 'all' ? brandParam : undefined,
        q: searchParam || undefined,
        sort: sortParam,
        max_price: priceRange < 800 ? priceRange : undefined,
        min_rating: minRating || undefined,
        discount_min: discountMin || undefined,
        in_stock: inStockOnly ? 'true' : undefined,
        limit: 40
      };

      const res = await productApi.getProducts(params);
      if (res.success) {
        setProducts(res.products);
        setTotalProducts(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, brandParam, searchParam, sortParam, priceRange, minRating, discountMin, inStockOnly]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  // Update query params
  const handleCategoryChange = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug && slug !== 'all') {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleBrandChange = (brandName) => {
    const next = new URLSearchParams(searchParams);
    if (brandName && brandName !== 'all') {
      next.set('brand', brandName);
    } else {
      next.delete('brand');
    }
    setSearchParams(next);
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setPriceRange(800);
    setMinRating(null);
    setDiscountMin(null);
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {searchParam ? `Results for "${searchParam}"` : (categoryParam !== 'all' ? `${categoryParam.replace('-', ' ').toUpperCase()} Collection` : 'Product Catalog')}
          </h1>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Showing {products.length} of {totalProducts} premium items
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input-field"
              style={{
                padding: '8px 32px 8px 14px',
                fontSize: '0.85rem',
                borderRadius: '999px',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="discount">Biggest Savings</option>
            </select>
            <ArrowUpDown size={14} color="#94A3B8" style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Main Grid Layout with Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Filter Sidebar (Desktop) */}
        <FilterDrawer
          categories={categories}
          brands={brands}
          selectedCategory={categoryParam}
          setSelectedCategory={handleCategoryChange}
          selectedBrand={brandParam}
          setSelectedBrand={handleBrandChange}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
          discountMin={discountMin}
          setDiscountMin={setDiscountMin}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          onClearFilters={handleClearFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Product Grid */}
        <div>
          {loading ? (
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card" style={{ height: '360px', padding: '16px' }}>
                  <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ width: '40%', height: '24px' }} />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#64748B'
              }}>
                <SearchX size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>No matches found</h3>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '400px', margin: '0 auto 20px' }}>
                We couldn't find any products matching your specific filters. Try expanding your price range or clearing filters.
              </p>
              <button onClick={handleClearFilters} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
};

export default Products;
