import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/EnhancedCartContext';
import { LoadingSpinner } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function EnhancedCartPage() {
  const { user, logout } = useAuth();
  const {
    cart,
    loading,
    error,
    businessCalculation,
    updateCartItem,
    removeFromCart,
    clearCart,
    startCheckout,
    completeCheckout,
    cancelCheckout,
    hasItems,
    isReserved,
    isReservationExpired,
    canModify,
    getTotalWeight,
    isShippingAvailable,
    isWeightLimitExceeded,
    getWeightWarning,
    notification,
    clearNotification,
    invoice,
    reservationSecondsRemaining,
    reservationMinutes
  } = useCart();
  
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [hasShownWeightAlert, setHasShownWeightAlert] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  const isInitialLoading = loading && !cart;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!cart) {
      return;
    }

    const exceedsLimit = isWeightLimitExceeded();

    if (exceedsLimit && !hasShownWeightAlert) {
      const currentWeight = getTotalWeight();
      const warningMessage = getWeightWarning() ||
        `⚠️ Your cart weighs ${currentWeight.toLocaleString()} lbs, which exceeds the 48,000 lbs limit. Pickup will be required.`;

      alert(warningMessage);
      setHasShownWeightAlert(true);
    } else if (!exceedsLimit && hasShownWeightAlert) {
      setHasShownWeightAlert(false);
    }
  }, [cart, businessCalculation, isWeightLimitExceeded, getWeightWarning, getTotalWeight, hasShownWeightAlert]);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 8000);

    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!user) {
    return null; // Will redirect to login
  }

  if (isInitialLoading) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="bg-white min-h-screen relative">
        <NavBar user={user} onLogout={logout} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (item, newCrateQty, newPieceQty) => {
    if (newCrateQty === 0 && newPieceQty === 0) {
      return handleRemoveItem(item);
    }

    try {
      setUpdatingItem(item.variantTypeId);
      await updateCartItem(item.variantTypeId, newCrateQty, newPieceQty);
    } catch (err) {
      console.error('Error updating item:', err);
      alert(err.message || 'Failed to update item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      setUpdatingItem(item.variantTypeId);
      await removeFromCart(item.variantTypeId);
    } catch (err) {
      console.error('Error removing item:', err);
      alert(err.message || 'Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      setIsClearing(true);
      await clearCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert(err.message || 'Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = async () => {
    if (!isReserved && !isShippingAvailable() && !showShippingModal) {
      setShowShippingModal(true);
      return;
    }

    try {
      setIsStartingCheckout(true);
      if (!isReserved) {
        await startCheckout();
      }

      const payload = await completeCheckout();
      navigate('/checkout', {
        state: {
          autoOpenInvoice: true,
          orderId: payload?.orderId || payload?.order?._id || null
        }
      });
    } catch (err) {
      console.error('Error processing checkout:', err);
      alert(err.message || 'Failed to complete checkout. Please try again.');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!isReserved && !isReservationExpired) {
      return;
    }

    try {
      setIsCancellingReservation(true);
      await cancelCheckout();
    } catch (err) {
      console.error('Error cancelling checkout:', err);
      alert(err.message || 'Failed to cancel checkout');
    } finally {
      setIsCancellingReservation(false);
    }
  };

  const formatWeight = (weight) => {
    return weight ? weight.toLocaleString() + ' lbs' : '0 lbs';
  };

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString();
  };

  const formatReservationCountdown = () => {
    if (!isReserved || reservationSecondsRemaining <= 0) {
      return '00:00';
    }

    const minutes = Math.floor(reservationSecondsRemaining / 60);
    const seconds = reservationSecondsRemaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatDateTime = (value) => {
    if (!value) return null;
    try {
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(value));
    } catch (err) {
      return value;
    }
  };

  const notificationStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      button: 'text-green-700 hover:text-green-900'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      button: 'text-blue-700 hover:text-blue-900'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      button: 'text-yellow-700 hover:text-yellow-900'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      button: 'text-red-700 hover:text-red-900'
    }
  };

  const notificationStyle = notification ? (notificationStyles[notification.type] || notificationStyles.info) : null;

  const checkoutButtonLabel = () => {
    if (isStartingCheckout) {
      return isReserved ? 'Finalizing Order...' : 'Securing Inventory...';
    }
    if (isReserved) return 'Finalize & View Invoice';
    if (loading) return 'Processing...';
    return 'Lock Inventory & Generate Invoice';
  };

  return (
    <div className="bg-white min-h-screen relative">
      <NavBar user={user} onLogout={logout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleClearCart}
              disabled={isClearing || isReserved}
              className="px-4 py-2 text-red-600 hover:text-red-800 transition disabled:opacity-50"
            >
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>
        </div>

        {notification && notificationStyle && (
          <div className={`mb-6 border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${notificationStyle.container}`}>
            <p className={`text-sm leading-relaxed ${notificationStyle.text}`}>{notification.message}</p>
            <button
              onClick={clearNotification}
              className={`text-xs font-medium ${notificationStyle.button}`}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Reservation Notice */}
        {isReserved && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-blue-900">
                <h3 className="font-semibold">Inventory Reserved</h3>
                <p className="text-sm">
                  Your items are locked in for checkout. Time remaining: <span className="font-medium">{formatReservationCountdown()}</span>
                  {reservationMinutes ? ` of ${reservationMinutes} minutes` : ''}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Continue to Checkout
                </button>
                <button
                  onClick={handleCancelReservation}
                  disabled={isCancellingReservation}
                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-white/60 transition disabled:opacity-60"
                >
                  {isCancellingReservation ? 'Releasing...' : 'Cancel Reservation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isReservationExpired && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-orange-900">
                <h3 className="font-semibold">Reservation Expired</h3>
                <p className="text-sm">The hold on your items has lapsed. Cancel to refresh the cart or start checkout again to re-reserve.</p>
              </div>
              <button
                onClick={handleCancelReservation}
                disabled={isCancellingReservation}
                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition disabled:opacity-60"
              >
                {isCancellingReservation ? 'Refreshing...' : 'Unlock Cart'}
              </button>
            </div>
          </div>
        )}

        {/* Weight Warning */}
        {getWeightWarning() && (
          <div className={`border p-4 rounded-lg mb-6 ${
            isWeightLimitExceeded() 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isWeightLimitExceeded() ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {isWeightLimitExceeded() ? 'Shipping Not Available' : 'Weight Notice'}
            </h3>
            <p className={`text-sm ${
              isWeightLimitExceeded() ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {getWeightWarning()}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const isUpdating = updatingItem === item.variantTypeId;
              const crateQty = item.metadata?.crateQty || 0;
              const pieceQty = item.metadata?.pieceQty || 0;
              const piecesPerCrate = item.metadata?.piecesPerCrate || 10;
              const totalPieces = (crateQty * piecesPerCrate) + pieceQty;
              const fillerPieces = item.metadata?.fillerPieces || 0;
              const weight = item.metadata?.weight || 0;

              return (
                <div
                  key={item.variantTypeId}
                  className={`bg-white border rounded-lg p-6 ${
                    isUpdating ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.variantTypeId?.images?.[0] || '/granite-landscaping-products.png'}
                        alt={item.variantTypeId?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {item.variantTypeId?.name || 'Product'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.variantTypeId?.category || 'Category'} • 
                        Unit Price: {formatCurrency(item.unitPrice)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex gap-4 mb-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Crates ({piecesPerCrate} pieces each)
                          </label>
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => handleUpdateQuantity(item, Math.max(0, crateQty - 1), pieceQty)}
                              disabled={isUpdating || !canModify}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={crateQty}
                              onChange={(e) => {
                                const newQty = Math.max(0, parseInt(e.target.value) || 0);
                                handleUpdateQuantity(item, newQty, pieceQty);
                              }}
                              className="flex-1 px-2 py-1 text-center border-0 focus:ring-0 text-sm"
                              min="0"
                              disabled={isUpdating || !canModify}
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item, crateQty + 1, pieceQty)}
                              disabled={isUpdating || !canModify}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Individual Pieces
                          </label>
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => handleUpdateQuantity(item, crateQty, Math.max(0, pieceQty - 1))}
                              disabled={isUpdating || !canModify}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={pieceQty}
                              onChange={(e) => {
                                const newQty = Math.max(0, parseInt(e.target.value) || 0);
                                handleUpdateQuantity(item, crateQty, newQty);
                              }}
                              className="flex-1 px-2 py-1 text-center border-0 focus:ring-0 text-sm"
                              min="0"
                              disabled={isUpdating || !canModify}
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item, crateQty, pieceQty + 1)}
                              disabled={isUpdating || !canModify}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item Summary */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Pieces:</span>
                          <span className="ml-2 font-medium">{totalPieces}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-2 font-medium">{formatWeight(weight)}</span>
                        </div>
                        {fillerPieces > 0 && (
                          <>
                            <div>
                              <span className="text-orange-600">Filler Pieces:</span>
                              <span className="ml-2 font-medium">{fillerPieces}</span>
                            </div>
                            <div>
                              <span className="text-orange-600">Filler Charges:</span>
                              <span className="ml-2 font-medium">{formatCurrency(item.metadata?.fillerCharges)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Item Actions */}
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={isUpdating || !canModify}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          {isUpdating ? <LoadingSpinner size="sm" /> : 'Remove'}
                        </button>
                        <div className="text-lg font-semibold">
                          {formatCurrency(item.finalPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Basic Cart Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
                
                {/* Enhanced Business Logic Summary */}
                {businessCalculation && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Items Subtotal:</span>
                      <span>{formatCurrency(businessCalculation.subtotal)}</span>
                    </div>
                    
                    {businessCalculation.discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Tier Discount ({businessCalculation.discountPercent}%):</span>
                        <span>-{formatCurrency(businessCalculation.discountAmount)}</span>
                      </div>
                    )}
                    
                    {businessCalculation.totalFillerCharges > 0 && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Filler Charges:</span>
                        <span>{formatCurrency(businessCalculation.totalFillerCharges)}</span>
                      </div>
                    )}
                    
                    {businessCalculation.shippingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Shipping Fee:</span>
                        <span>{formatCurrency(businessCalculation.shippingFee)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Weight Information */}
              <div className="border-t pt-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Weight:</span>
                  <span className="font-medium">{formatWeight(getTotalWeight())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Available:</span>
                  <span className={`font-medium ${isShippingAvailable() ? 'text-green-600' : 'text-red-600'}`}>
                    {isShippingAvailable() ? 'Yes' : 'No (Pickup Required)'}
                  </span>
                </div>
              </div>

              {/* Final Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(businessCalculation?.finalTotal || cart.total)}</span>
                </div>
              </div>

              {invoice && (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Pro Forma Invoice</span>
                    <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued</span>
                    <span>{formatDateTime(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due</span>
                    <span>{formatDateTime(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Due</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.totals?.totalDue)}</span>
                  </div>
                  {invoice.reservation?.reservedUntil && (
                    <p className="text-xs leading-relaxed text-gray-500">
                      Reservation valid through {formatDateTime(invoice.reservation.reservedUntil)}.
                    </p>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || isStartingCheckout}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 
                  ${loading || isStartingCheckout
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                  }
                `}
              >
                {checkoutButtonLabel()}
              </button>

              {/* Delivery Information */}
              <div className="mt-4 text-xs text-gray-500">
                <p>
                  {isShippingAvailable() 
                    ? '🚚 Shipping available for this order'
                    : '🏪 Pickup required for this order (weight limit exceeded)'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Shipping Not Available</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your order weighs {formatWeight(getTotalWeight())}, which exceeds our shipping weight limit. 
              This order must be picked up from our location.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              You can still proceed to checkout, but pickup will be required.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowShippingModal(false);
                  handleCheckout();
                }}
                disabled={isStartingCheckout}
                className={`px-4 py-2 rounded text-white ${
                  isStartingCheckout ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-900'
                }`}
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}