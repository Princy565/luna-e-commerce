import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();
  
  const [cart, setCart] = useState({
    items: [],
    items_count: 0,
    subtotal: 0,
    discount: 0,
    coupon: null,
    shipping_fee: 0,
    tax: 0,
    total: 0,
    qualifies_free_shipping: false,
    free_shipping_threshold: 999
  });
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async (couponCode = appliedCoupon) => {
    if (!user) {
      setCart({
        items: [],
        items_count: 0,
        subtotal: 0,
        discount: 0,
        coupon: null,
        shipping_fee: 0,
        tax: 0,
        total: 0,
        qualifies_free_shipping: false,
        free_shipping_threshold: 999
      });
      return;
    }

    try {
      setLoading(true);
      const res = await cartApi.getCart(couponCode);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user, appliedCoupon]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  const addToCart = async (productId, quantity = 1, color = null, size = null) => {
    if (!user) {
      addToast('Please sign in to add items to your cart', 'info');
      openAuthModal('login');
      return false;
    }

    try {
      const res = await cartApi.addToCart(productId, quantity, color, size);
      if (res.success && res.cart) {
        setCart(res.cart);
        addToast(res.message || 'Added to bag', 'success');
        return true;
      }
    } catch (err) {
      addToast(err.message || 'Could not add to cart', 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    try {
      const res = await cartApi.updateCartItem(itemId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      addToast(err.message || 'Could not update quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return;
    try {
      const res = await cartApi.deleteCartItem(itemId);
      if (res.success && res.cart) {
        setCart(res.cart);
        addToast('Item removed from cart', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Could not remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await cartApi.clearCart();
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async (code) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!code) {
      addToast('Please enter a coupon code', 'error');
      return;
    }

    try {
      const res = await cartApi.validateCoupon(code);
      if (res.success && res.cart) {
        setCart(res.cart);
        setAppliedCoupon(code);
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Invalid coupon', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    fetchCart('');
    addToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
