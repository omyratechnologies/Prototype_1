import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService, businessLogicService } from '../services/enhancedApi.js';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessCalculation, setBusinessCalculation] = useState(null);
  const [shippingValidation, setShippingValidation] = useState(null);
  
  // Get auth context safely
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
      clearLocalCart();
    }
  }, [user, authLoading]);

  // Clear local cart state
  const clearLocalCart = useCallback(() => {
    setCart(null);
    setError(null);
    setBusinessCalculation(null);
    setShippingValidation(null);
  }, []);

  // Load cart from backend
  const loadCart = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      const cartData = response.data?.cart;
      
      setCart(cartData);
      
      // If cart has items, calculate business logic
      if (cartData && cartData.items && cartData.items.length > 0) {
        await calculateBusinessLogic(cartData.items);
      } else {
        setBusinessCalculation(null);
        setShippingValidation(null);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
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

  // Calculate business logic for cart items
  const calculateBusinessLogic = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
      setBusinessCalculation(null);
      setShippingValidation(null);
      return;
    }

    try {
      // Convert cart items to business logic format
      const businessItems = cartItems.map(item => ({
        productId: item.variantTypeId,
        crateQty: item.metadata?.crateQty || 0,
        pieceQty: item.metadata?.pieceQty || 0
      }));

      // Calculate business logic and shipping validation in parallel
      const [calcResponse, shippingResponse] = await Promise.all([
        businessLogicService.calculateCart(businessItems),
        businessLogicService.checkShippingWeight(businessItems)
      ]);

      setBusinessCalculation(calcResponse.data || null);
      setShippingValidation(shippingResponse.data || null);
    } catch (err) {
      console.error('Error calculating business logic:', err);
      // Don't set error state here as it's supplementary data
    }
  }, []);

  // Add item to cart with enhanced business logic
  const addToCart = useCallback(async (variantTypeId, crateQty = 0, pieceQty = 0, metadata = {}) => {
    if (!user) {
      throw new Error('Please log in to add items to cart');
    }

    if (crateQty === 0 && pieceQty === 0) {
      throw new Error('Please specify at least one crate or piece');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.addToCart(variantTypeId, crateQty, pieceQty, metadata);
      const updatedCart = response.data?.cart;
      
      setCart(updatedCart);
      
      // Recalculate business logic
      if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
        await calculateBusinessLogic(updatedCart.items);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, calculateBusinessLogic]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (variantTypeId, crateQty, pieceQty) => {
    if (!user) {
      throw new Error('Please log in to update cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.updateCartItem(variantTypeId, crateQty, pieceQty);
      const updatedCart = response.data?.cart;
      
      setCart(updatedCart);
      
      // Recalculate business logic
      if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
        await calculateBusinessLogic(updatedCart.items);
      } else {
        setBusinessCalculation(null);
        setShippingValidation(null);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error updating cart item:', err);
      const errorMessage = err.message || 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, calculateBusinessLogic]);

  // Remove item from cart
  const removeFromCart = useCallback(async (variantTypeId) => {
    if (!user) {
      throw new Error('Please log in to remove items from cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.removeFromCart(variantTypeId);
      const updatedCart = response.data?.cart;
      
      setCart(updatedCart);
      
      // Recalculate business logic
      if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
        await calculateBusinessLogic(updatedCart.items);
      } else {
        setBusinessCalculation(null);
        setShippingValidation(null);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, calculateBusinessLogic]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to clear cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.clearCart();
      
      setCart({
        _id: null,
        userId: user._id,
        items: [],
        total: 0,
        status: 'active',
        reservedUntil: null
      });
      setBusinessCalculation(null);
      setShippingValidation(null);
      
      return response.data;
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reserve cart for checkout
  const reserveForCheckout = useCallback(async (timeoutMinutes = 5) => {
    if (!user || !cart) {
      throw new Error('Please log in and have items in cart to reserve');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.reserveForCheckout(timeoutMinutes);
      const updatedCart = response.data?.cart;
      
      setCart(updatedCart);
      
      return response.data;
    } catch (err) {
      console.error('Error reserving cart:', err);
      const errorMessage = err.message || 'Failed to reserve cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, cart]);

  // Release cart reservation
  const releaseReservation = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to release reservation');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.releaseReservation();
      const updatedCart = response.data?.cart;
      
      setCart(updatedCart);
      
      return response.data;
    } catch (err) {
      console.error('Error releasing reservation:', err);
      const errorMessage = err.message || 'Failed to release reservation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Validate cart before checkout
  const validateCart = useCallback(async () => {
    if (!user || !cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or invalid');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.validateCart();
      
      return response.data;
    } catch (err) {
      console.error('Error validating cart:', err);
      const errorMessage = err.message || 'Cart validation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, cart]);

  // Get cart summary with business calculations
  const getCartSummary = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      const response = await cartService.getCartSummary();
      return response.data;
    } catch (err) {
      console.error('Error getting cart summary:', err);
      return null;
    }
  }, [user]);

  // Calculate item count
  const getItemCount = useCallback(() => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const crateQty = item.metadata?.crateQty || 0;
      const pieceQty = item.metadata?.pieceQty || 0;
      const piecesPerCrate = item.metadata?.piecesPerCrate || 10;
      return total + (crateQty * piecesPerCrate) + pieceQty;
    }, 0);
  }, [cart]);

  // Calculate total weight
  const getTotalWeight = useCallback(() => {
    if (!businessCalculation) return 0;
    return businessCalculation.totalWeight || 0;
  }, [businessCalculation]);

  // Check if shipping is available
  const isShippingAvailable = useCallback(() => {
    if (!shippingValidation) return true;
    return shippingValidation.allowShipping !== false;
  }, [shippingValidation]);

  // Check if weight limit exceeded
  const isWeightLimitExceeded = useCallback(() => {
    if (!shippingValidation) return false;
    return shippingValidation.exceedsLimit === true;
  }, [shippingValidation]);

  // Get weight warning message
  const getWeightWarning = useCallback(() => {
    if (!shippingValidation || !shippingValidation.exceedsLimit) return null;
    return shippingValidation.message || 'Weight limit exceeded';
  }, [shippingValidation]);

  const value = {
    // Cart state
    cart,
    loading,
    error,
    businessCalculation,
    shippingValidation,
    
    // Cart actions
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    reserveForCheckout,
    releaseReservation,
    validateCart,
    getCartSummary,
    
    // Utility functions
    getItemCount,
    getTotalWeight,
    isShippingAvailable,
    isWeightLimitExceeded,
    getWeightWarning,
    
    // State checks
    hasItems: cart && cart.items && cart.items.length > 0,
    isReserved: cart && cart.reservedUntil && new Date(cart.reservedUntil) > new Date(),
    canModify: cart && cart.status === 'active' && (!cart.reservedUntil || new Date(cart.reservedUntil) <= new Date()),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}