import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/EnhancedCartContext';
import { LoadingSpinner, ErrorMessage } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function CartPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    cartTotal,
    itemCount,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    startCheckout,
    loadCart
  } = useCart();

  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Cart is automatically loaded by CartContext when user is available
    // No need to call loadCart() here to avoid duplicate requests
  }, [user, navigate]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.message || 'Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.message || 'Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert(error.message || 'Failed to clear cart');
      }
    }
  };

  const handleCheckout = async () => {
    try {
      await startCheckout();
      navigate('/checkout');
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert(error.message || 'Failed to start checkout');
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="bg-white min-h-screen">
      <NavBar user={user} onLogout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <ErrorMessage error={error} onRetry={loadCart} />
        )}

        {!loading && cartItems.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8l1 6h16m-16 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started with your order.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.variantTypeId?._id || item.variantTypeId} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.variantTypeId?.images?.[0] || '/granite-landscaping-products.png'}
                        alt={item.variantTypeId?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.variantTypeId?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Unit Price: ₹{item.unitPrice?.toLocaleString()}
                      </p>
                      {item.discountApplied > 0 && (
                        <p className="text-sm text-green-600 mb-2">
                          Discount: {item.discountApplied}% off
                        </p>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 mt-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleUpdateQuantity(item.variantTypeId?._id || item.variantTypeId, item.quantity - 1)}
                            disabled={updating[item.variantTypeId?._id || item.variantTypeId]}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-center min-w-[50px]">
                            {updating[item.variantTypeId?._id || item.variantTypeId] ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.variantTypeId?._id || item.variantTypeId, item.quantity + 1)}
                            disabled={updating[item.variantTypeId?._id || item.variantTypeId]}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.variantTypeId?._id || item.variantTypeId)}
                          disabled={updating[item.variantTypeId?._id || item.variantTypeId]}
                          className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{item.finalPrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ({item.quantity} × ₹{(item.finalPrice / item.quantity)?.toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({itemCount})</span>
                    <span className="text-gray-900">₹{cartTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{cartTotal?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}