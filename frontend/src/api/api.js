const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('luna_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('luna_token', token);
  } else {
    localStorage.removeItem('luna_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// API Methods
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, phone) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) }),
  getProfile: () => apiRequest('/auth/me'),
  updateProfile: (profileData) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getAddresses: () => apiRequest('/auth/addresses'),
  addAddress: (address) => apiRequest('/auth/addresses', { method: 'POST', body: JSON.stringify(address) }),
  updateAddress: (id, address) => apiRequest(`/auth/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  deleteAddress: (id) => apiRequest(`/auth/addresses/${id}`, { method: 'DELETE' }),
};

export const productApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiRequest(`/products?${query.toString()}`);
  },
  getProductById: (id) => apiRequest(`/products/${id}`),
  getProductBySlug: (slug) => apiRequest(`/products/slug/${slug}`),
  getSuggestions: (q) => apiRequest(`/products/search/suggestions?q=${encodeURIComponent(q)}`),
  getCategories: () => apiRequest('/products/categories'),
  getBrands: () => apiRequest('/products/brands'),
};

export const cartApi = {
  getCart: (coupon) => apiRequest(`/cart${coupon ? `?coupon=${encodeURIComponent(coupon)}` : ''}`),
  addToCart: (productId, quantity = 1, color, size) => apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity, color, size })
  }),
  updateCartItem: (itemId, quantity) => apiRequest(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  deleteCartItem: (itemId) => apiRequest(`/cart/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart/clear', { method: 'DELETE' }),
  validateCoupon: (code) => apiRequest('/cart/coupon/validate', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),
};

export const wishlistApi = {
  getWishlist: () => apiRequest('/wishlist'),
  addToWishlist: (productId) => apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  }),
  removeFromWishlist: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),
  moveToCart: (productId) => apiRequest(`/wishlist/move-to-cart/${productId}`, { method: 'POST' }),
};

export const orderApi = {
  getOrders: () => apiRequest('/orders'),
  getOrderDetails: (id) => apiRequest(`/orders/${id}`),
  getOrderByNumber: (number) => apiRequest(`/orders/by-number/${number}`),
  checkout: (checkoutData) => apiRequest('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData)
  }),
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, { method: 'POST' }),
};

export const reviewApi = {
  getProductReviews: (productId) => apiRequest(`/reviews/product/${productId}`),
  addReview: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
};

export const adminApi = {
  getStats: () => apiRequest('/admin/statistics'),
  getOrders: (status) => apiRequest(`/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (orderId, status) => apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  createProduct: (productData) => apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  updateProduct: (productId, productData) => apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  deleteProduct: (productId) => apiRequest(`/admin/products/${productId}`, { method: 'DELETE' }),
};
