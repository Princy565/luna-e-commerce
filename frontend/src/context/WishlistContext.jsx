import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { refreshCart } = useCart();
  const { addToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res.success && res.items) {
        setWishlistItems(res.items);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, user]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product_id === productId || item.product?.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      addToast('Please sign in to save items to your wishlist', 'info');
      openAuthModal('login');
      return;
    }

    const inList = isInWishlist(product.id);
    if (inList) {
      try {
        await wishlistApi.removeFromWishlist(product.id);
        setWishlistItems((prev) => prev.filter((i) => i.product_id !== product.id && i.product?.id !== product.id));
        addToast(`Removed "${product.title}" from wishlist`, 'info');
      } catch (err) {
        addToast(err.message || 'Could not update wishlist', 'error');
      }
    } else {
      try {
        const res = await wishlistApi.addToWishlist(product.id);
        if (res.success) {
          fetchWishlist();
          addToast(`Added "${product.title}" to wishlist`, 'success');
        }
      } catch (err) {
        addToast(err.message || 'Could not add to wishlist', 'error');
      }
    }
  };

  const moveToCart = async (productId) => {
    if (!user) return;
    try {
      const res = await wishlistApi.moveToCart(productId);
      if (res.success) {
        setWishlistItems((prev) => prev.filter((i) => i.product_id !== productId && i.product?.id !== productId));
        refreshCart();
        addToast(res.message || 'Moved item to bag', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Could not move item to cart', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
