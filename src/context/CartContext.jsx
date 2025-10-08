/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/index.js";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Safely get auth context
  let user = null;
  let authLoading = true;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.loading || false;
  } catch (e) {
    console.warn('CartProvider: Auth context not available, operating without authentication');
    authLoading = false;
  }

  // Load cart when user logs in
  useEffect(() => {
    if (!authLoading && user) {
      loadCart();
    } else if (!authLoading && !user) {
      // Clear cart when user logs out
      setCart(null);
      setError(null);
    }
  }, [user, authLoading]);

  const loadCart = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      setCart(response.data.cart);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
      // Initialize empty cart structure on error
      setCart({
        _id: null,
        userId: user._id,
        items: [],
        total: 0,
        status: 'active',
        reservedUntil: null
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCartInternal = useCallback(async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please log in to add items to cart');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCartItem = useCallback(async (productId, quantity) => {
    if (!user) {
      throw new Error('Please log in to update cart');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.updateCartItem(productId, quantity);
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.message || 'Failed to update cart item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId) => {
    if (!user) {
      throw new Error('Please log in to remove items from cart');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.removeFromCart(productId);
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to clear cart');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.clearCart();
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startCheckout = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to checkout');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.startCheckout();
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error starting checkout:', err);
      setError(err.response?.data?.message || 'Failed to start checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelCheckout = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to cancel checkout');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.cancelCheckout();
      setCart(response.data.cart);
      return response.data;
    } catch (err) {
      console.error('Error canceling checkout:', err);
      setError(err.response?.data?.message || 'Failed to cancel checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Computed values
  const cartItems = cart?.items || [];
  const cartTotal = cart?.total || 0;
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isReserved = cart?.reservedUntil && new Date(cart.reservedUntil) > new Date();

  const value = {
    // Cart data
    cart,
    cartItems,
    cartTotal,
    itemCount,
    isReserved,
    
    // Loading states
    loading,
    error,
    
    // Actions
    loadCart,
    addToCart: async (productId, quantity = 1) => {
      // Support both old and new format for backward compatibility
      if (typeof productId === 'object' && productId.id) {
        return addToCartInternal(productId.id, productId.quantity || quantity);
      }
      return addToCartInternal(productId, quantity);
    },
    updateCartItem,
    removeFromCart,
    clearCart,
    startCheckout,
    cancelCheckout,
    
    // Legacy aliases for backward compatibility
    updateQuantity: updateCartItem,
    checkoutData: null, // Deprecated - will be replaced by proper checkout flow
    saveCheckoutData: () => {}, // Deprecated
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
