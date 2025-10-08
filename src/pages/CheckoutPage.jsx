import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/EnhancedCartContext';
import { LoadingSpinner, ErrorMessage } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function CheckoutPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    cartTotal,
    itemCount,
    loading,
    error,
    cancelCheckout,
    loadCart
  } = useCart();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    instructions: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Cart is automatically loaded by CartContext when user is available
    // No need to call loadCart() here to avoid duplicate requests
  }, [user, navigate]);

  useEffect(() => {
    // Auto-cancel checkout after 10 minutes (600 seconds)
    const timer = setTimeout(async () => {
      try {
        await cancelCheckout();
        alert('Checkout session expired due to inactivity. Items have been released from reservation.');
        navigate('/cart');
      } catch (error) {
        console.error('Error canceling checkout:', error);
      }
    }, 600000); // 10 minutes

    return () => clearTimeout(timer);
  }, [cancelCheckout, navigate]);

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingInfo[field].trim()) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }

    // Basic pincode validation
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // In a real app, this would integrate with a payment gateway
      // For now, we'll simulate the order placement
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock order creation (in real app, call backend API)
      const orderData = {
        cartId: cart._id,
        shippingInfo,
        paymentMethod,
        items: cartItems,
        total: cartTotal,
        orderDate: new Date().toISOString()
      };

      console.log('Order placed:', orderData);
      
      setOrderCompleted(true);
      
      // Clear cart after successful order (this would happen on backend)
      // In real implementation, backend would handle this
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCheckout = async () => {
    if (window.confirm('Are you sure you want to cancel checkout? Items will be released from reservation.')) {
      try {
        await cancelCheckout();
        navigate('/cart');
      } catch (error) {
        console.error('Error canceling checkout:', error);
        alert(error.message || 'Failed to cancel checkout');
      }
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (orderCompleted) {
    return (
      <div className="bg-white min-h-screen">
        <NavBar user={user} onLogout={logout} />
        
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <NavBar user={user} onLogout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <button
            onClick={handleCancelCheckout}
            className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Cancel Checkout
          </button>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No items in cart</h2>
            <p className="text-gray-600 mb-6">Add some items to proceed with checkout.</p>
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
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={shippingInfo.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label htmlFor="card" className="ml-3 text-sm font-medium text-gray-700">
                      Credit/Debit Card
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="upi"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label htmlFor="upi" className="ml-3 text-sm font-medium text-gray-700">
                      UPI
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label htmlFor="cod" className="ml-3 text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.variantTypeId?._id || item.variantTypeId} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.variantTypeId?.name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.finalPrice?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="text-gray-900">₹{cartTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
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
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || loading || cartItems.length === 0}
                  className="w-full py-3 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>🕒 Items are reserved for 10 minutes</p>
                  <p>Your items will be automatically released if checkout is not completed within this time.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}