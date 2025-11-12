import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService, businessLogicService } from '../services/enhancedApi.js';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const CART_STORAGE_PREFIX = 'cart_snapshot_';

const normalizeVariantTypeId = (value) => {
  if (!value) return null;

  if (typeof value === 'object') {
    if (typeof value.toHexString === 'function') {
      return value.toHexString();
    }

    const nestedKeys = ['_id', 'id', 'variantTypeId'];
    for (const key of nestedKeys) {
      if (value[key]) {
        const normalized = normalizeVariantTypeId(value[key]);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  const stringValue = (typeof value === 'string' ? value : value?.toString?.())?.trim() || '';
  if (!stringValue) return null;

  if (/^[0-9a-fA-F]{24}$/.test(stringValue)) {
    return stringValue;
  }

  const match = stringValue.match(/[0-9a-fA-F]{24}/);
  return match ? match[0] : null;
};

const normalizeCart = (cartData) => {
  if (!cartData) return cartData;

  if (Array.isArray(cartData.items)) {
    cartData.items = cartData.items.map(item => ({
      ...item,
      variantTypeId: normalizeVariantTypeId(item.variantTypeId)
    }));
  }

  return cartData;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const DEFAULT_RESERVATION_MINUTES = 5;
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessCalculation, setBusinessCalculation] = useState(null);
  const [shippingValidation, setShippingValidation] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [notification, setNotification] = useState(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState(null);
  const [reservationSecondsRemaining, setReservationSecondsRemaining] = useState(0);
  const [reservationMinutes, setReservationMinutes] = useState(DEFAULT_RESERVATION_MINUTES);
  const cartRef = useRef(null);
  
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

  useEffect(() => {
    if (!reservationExpiresAt) {
      setReservationSecondsRemaining(0);
      return;
    }

    const expiresAtDate = new Date(reservationExpiresAt);
    if (Number.isNaN(expiresAtDate.getTime())) {
      setReservationSecondsRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const secondsLeft = Math.max(0, Math.floor((expiresAtDate.getTime() - Date.now()) / 1000));
      setReservationSecondsRemaining(secondsLeft);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [reservationExpiresAt]);

  const getCartStorageKey = useCallback(() => {
    if (!user?._id) return null;
    return `${CART_STORAGE_PREFIX}${user._id}`;
  }, [user]);

  useEffect(() => {
    if (!user || authLoading) {
      return;
    }

    const storageKey = getCartStorageKey();
    if (!storageKey) {
      return;
    }

    const savedState = localStorage.getItem(storageKey);
    if (!savedState) {
      return;
    }

    try {
      const parsed = JSON.parse(savedState);
      hydrateCartState({
        cart: parsed.cart,
        calculation: parsed.calculation,
        invoice: parsed.invoice,
        reservedUntil: parsed.reservedUntil,
        reservationMinutes: parsed.reservationMinutes,
        notification: parsed.notification
      }).catch((error) => {
        console.warn('Failed to apply saved cart snapshot.', error);
      });
    } catch (error) {
      console.warn('Failed to restore saved cart state. Clearing snapshot.', error);
      localStorage.removeItem(storageKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    const storageKey = getCartStorageKey();
    if (!storageKey) {
      return;
    }

    const snapshot = {
      cart,
      calculation: businessCalculation,
      invoice,
      reservedUntil: reservationExpiresAt,
      reservationMinutes,
      notification
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch (error) {
      console.warn('Unable to persist cart snapshot:', error);
    }
  }, [cart, businessCalculation, invoice, reservationExpiresAt, reservationMinutes, notification, getCartStorageKey]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Clear local cart state
  const clearLocalCart = useCallback(() => {
    setCart(null);
    setError(null);
    setBusinessCalculation(null);
    setShippingValidation(null);
    setInvoice(null);
    setNotification(null);
    setReservationExpiresAt(null);
    setReservationSecondsRemaining(0);
    setReservationMinutes(DEFAULT_RESERVATION_MINUTES);

    const storageKey = getCartStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [getCartStorageKey]);

  const applyBusinessCalculation = useCallback((calculationData, shippingData = null) => {
    if (calculationData) {
      setBusinessCalculation(calculationData);

      const weightWarning = calculationData.weightWarning || {};
      const deliveryOptions = calculationData.deliveryOptions || {};

      setShippingValidation({
        allowShipping: deliveryOptions.shipping !== false,
        allowPickup: deliveryOptions.pickup !== false,
        exceedsLimit: weightWarning.exceedsLimit || shippingData?.exceedsLimit || false,
        message: weightWarning.message || shippingData?.message || '',
        forcePickup: weightWarning.forcePickup || shippingData?.forcePickup || false
      });
      return;
    }

    if (shippingData) {
      setBusinessCalculation(null);
      setShippingValidation(shippingData);
      return;
    }

    setBusinessCalculation(null);
    setShippingValidation(null);
  }, []);
  // Calculate business logic for cart items
  const calculateBusinessLogic = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
      applyBusinessCalculation(null);
      return;
    }

    try {
      // Convert cart items to business logic format
      const businessItems = cartItems.map(item => ({
        productId: normalizeVariantTypeId(item.variantTypeId),
        crateQty: item.metadata?.crateQty || 0,
        pieceQty: item.metadata?.pieceQty || 0
      }));
      
      const filteredBusinessItems = businessItems.filter(item => !!item.productId);

      if (filteredBusinessItems.length === 0) {
        applyBusinessCalculation(null);
        return;
      }

      // Calculate business logic and shipping validation in parallel
      const [calcResponse, shippingResponse] = await Promise.all([
        businessLogicService.calculateCart(filteredBusinessItems),
        businessLogicService.checkShippingWeight(filteredBusinessItems)
      ]);

      applyBusinessCalculation(calcResponse.data || null, shippingResponse.data || null);
    } catch (err) {
      console.error('Error calculating business logic:', err);
      // Don't set error state here as it's supplementary data
    }
  }, [applyBusinessCalculation]);

  const hydrateCartState = useCallback(async ({
    cart: cartPayload,
    calculation,
    invoice: invoicePayload,
    reservedUntil,
    reservationMinutes: minutes,
    notification: notificationPayload
  } = {}) => {
    if (notificationPayload) {
      setNotification(notificationPayload);
    }

    let normalizedCart = null;

    if (cartPayload) {
      normalizedCart = normalizeCart({ ...cartPayload });
      setCart(normalizedCart);

      const expiresAt = reservedUntil || normalizedCart?.reservedUntil || null;
      setReservationExpiresAt(expiresAt ? new Date(expiresAt).toISOString() : null);

      if (typeof minutes === 'number') {
        setReservationMinutes(minutes);
      } else if (!expiresAt) {
  setReservationMinutes(DEFAULT_RESERVATION_MINUTES);
      }

      if (!normalizedCart?.items || normalizedCart.items.length === 0) {
        setInvoice(null);
      }
    } else if (cartRef.current) {
      normalizedCart = normalizeCart({ ...cartRef.current });
    }

    if (invoicePayload !== undefined) {
      setInvoice(invoicePayload);
    }

    if (calculation) {
      applyBusinessCalculation(calculation);
    } else if (normalizedCart && normalizedCart.items && normalizedCart.items.length > 0) {
      await calculateBusinessLogic(normalizedCart.items);
    } else {
      applyBusinessCalculation(null);
    }
  }, [applyBusinessCalculation, calculateBusinessLogic]);

  // Load cart from backend
  const loadCart = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      const cartData = normalizeCart(response.data?.cart);

      let summaryData = null;
      if (cartData && cartData.items && cartData.items.length > 0) {
        try {
          const summaryResponse = await cartService.getCartSummary();
          summaryData = summaryResponse.data || null;
        } catch (summaryError) {
          console.warn('Cart summary unavailable:', summaryError);
        }
      }

      if (summaryData) {
        await hydrateCartState({
          cart: summaryData.cart || cartData,
          calculation: summaryData.calculation,
          invoice: summaryData.invoice,
          reservedUntil: summaryData.reservedUntil,
          reservationMinutes: summaryData.reservationMinutes
        });
      } else if (cartData) {
        await hydrateCartState({ cart: cartData });
      } else {
        await hydrateCartState({
          cart: {
            _id: null,
            userId: user._id,
            items: [],
            total: 0,
            status: 'active',
            reservedUntil: null
          },
          calculation: null,
          invoice: null,
          reservedUntil: null
        });
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart');
      setCart({
        _id: null,
        userId: user?._id,
        items: [],
        total: 0,
        status: 'active',
        reservedUntil: null
      });
      applyBusinessCalculation(null);
      setInvoice(null);
      setReservationExpiresAt(null);
  setReservationMinutes(DEFAULT_RESERVATION_MINUTES);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState, applyBusinessCalculation]);

  // Load cart when user logs in
  useEffect(() => {
    if (!authLoading && user) {
      loadCart();
    } else if (!authLoading && !user) {
      // Clear cart when user logs out
      clearLocalCart();
    }
  }, [user, authLoading, loadCart, clearLocalCart]);

  // Add item to cart with enhanced business logic
  const addToCart = useCallback(async (variantTypeId, crateQty = 0, pieceQty = 0, metadata = {}) => {
    if (!user) {
      throw new Error('Please log in to add items to cart');
    }

    if (crateQty === 0 && pieceQty === 0) {
      throw new Error('Please specify at least one crate or piece');
    }

    const normalizedId = normalizeVariantTypeId(variantTypeId);
    if (!normalizedId) {
      throw new Error('Selected product could not be identified. Please refresh and try again.');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.addToCart(normalizedId, crateQty, pieceQty, metadata);
      await hydrateCartState({ cart: response.data?.cart });

      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (variantTypeId, crateQty, pieceQty) => {
    if (!user) {
      throw new Error('Please log in to update cart');
    }

    const normalizedId = normalizeVariantTypeId(variantTypeId);
    if (!normalizedId) {
      throw new Error('Selected product could not be identified for update.');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.updateCartItem(normalizedId, crateQty, pieceQty);
      await hydrateCartState({ cart: response.data?.cart });

      return response.data;
    } catch (err) {
      console.error('Error updating cart item:', err);
      const errorMessage = err.message || 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  // Remove item from cart
  const removeFromCart = useCallback(async (variantTypeId) => {
    if (!user) {
      throw new Error('Please log in to remove items from cart');
    }

    const normalizedId = normalizeVariantTypeId(variantTypeId);
    if (!normalizedId) {
      throw new Error('Selected product could not be identified for removal.');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.removeFromCart(normalizedId);
      await hydrateCartState({ cart: response.data?.cart });

      return response.data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to clear cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.clearCart();

      await hydrateCartState({
        cart: response.data?.cart || {
          _id: null,
          userId: user._id,
          items: [],
          total: 0,
          status: 'active',
          reservedUntil: null
        },
        calculation: null,
        invoice: null,
        reservedUntil: null,
        reservationMinutes: DEFAULT_RESERVATION_MINUTES
      });

      return response.data;
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  // Reserve cart for checkout
  const reserveForCheckout = useCallback(async (timeoutMinutes = 5) => {
    if (!user || !cart) {
      throw new Error('Please log in and have items in cart to reserve');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.reserveForCheckout(timeoutMinutes);
      const payload = response.data || {};

      await hydrateCartState({
        cart: payload.cart,
        reservedUntil: payload.reservedUntil,
        reservationMinutes: payload.reservationMinutes ?? timeoutMinutes
      });

      if (payload.message) {
        setNotification({ type: 'info', message: payload.message });
      }

      return payload;
    } catch (err) {
      console.error('Error reserving cart:', err);
      const errorMessage = err.message || 'Failed to reserve cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, cart, hydrateCartState]);

  // Release cart reservation
  const releaseReservation = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to release reservation');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.releaseReservation();
      const payload = response.data || {};

      await hydrateCartState({
        cart: payload.cart,
        calculation: payload.calculation,
        invoice: null,
        reservedUntil: null
      });

      if (payload.message) {
        setNotification({ type: 'info', message: payload.message });
      }

      return payload;
    } catch (err) {
      console.error('Error releasing reservation:', err);
      const errorMessage = err.message || 'Failed to release reservation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  const startCheckout = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to start checkout');
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty. Add items before starting checkout.');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cartService.startCheckout();
      const payload = response.data || {};

      await hydrateCartState({
        cart: payload.cart,
        calculation: payload.calculation,
        invoice: payload.invoice,
        reservedUntil: payload.reservedUntil,
        reservationMinutes: payload.reservationMinutes
      });

      setNotification({
        type: 'success',
        message: 'Checkout started. Finalize your invoice within the reservation window or cancel to keep editing your cart.'
      });

      return payload;
    } catch (err) {
      console.error('Error starting checkout:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start checkout';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, cart, hydrateCartState]);

  const completeCheckout = useCallback(async (options = {}) => {
    if (!user) {
      throw new Error('Please log in to complete checkout');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cartService.completeCheckout(options);
      const payload = response.data || {};

      await hydrateCartState({
        cart: payload.cart,
        calculation: payload.calculation,
        invoice: payload.invoice,
        reservedUntil: null,
  reservationMinutes: payload.reservationMinutes ?? DEFAULT_RESERVATION_MINUTES
      });

      setNotification({
        type: 'success',
        message: 'Checkout complete. Your invoice is ready to download.'
      });

      return payload;
    } catch (err) {
      console.error('Error completing checkout:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete checkout';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState]);

  const cancelCheckout = useCallback(async () => {
    if (!user) {
      throw new Error('Please log in to manage checkout');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cartService.cancelCheckout();
      const payload = response.data || {};

      await hydrateCartState({
        cart: payload.cart,
        calculation: payload.calculation,
        invoice: null,
        reservedUntil: null,
        reservationMinutes
      });

      setNotification({
        type: 'info',
        message: payload.reservationExpired
          ? 'Your reservation window had expired. The cart is unlocked and ready for edits.'
          : 'Checkout cancelled and inventory released. You can continue shopping.'
      });

      return payload;
    } catch (err) {
      console.error('Error cancelling checkout:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel checkout';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, hydrateCartState, reservationMinutes]);

  const clearNotification = useCallback(() => setNotification(null), []);

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
      const data = response.data;

      if (data) {
        await hydrateCartState({
          cart: data.cart,
          calculation: data.calculation,
          invoice: data.invoice,
          reservedUntil: data.reservedUntil,
          reservationMinutes: data.reservationMinutes
        });
      }

      return data;
    } catch (err) {
      console.error('Error getting cart summary:', err);
      return null;
    }
  }, [user, hydrateCartState]);

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
    invoice,
    notification,
    reservationExpiresAt,
    reservationSecondsRemaining,
    reservationMinutes,
    
    // Cart actions
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    reserveForCheckout,
    releaseReservation,
    startCheckout,
  completeCheckout,
    cancelCheckout,
    validateCart,
    getCartSummary,
    clearNotification,
    
    // Utility functions
    getItemCount,
    getTotalWeight,
    isShippingAvailable,
    isWeightLimitExceeded,
    getWeightWarning,
    
    // State checks
    hasItems: cart && cart.items && cart.items.length > 0,
    isReserved: Boolean(reservationExpiresAt && reservationSecondsRemaining > 0),
    isReservationExpired: Boolean(reservationExpiresAt && reservationSecondsRemaining === 0),
    canModify: cart && cart.status === 'active' && (!reservationExpiresAt || reservationSecondsRemaining <= 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}