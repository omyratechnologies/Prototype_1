import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/ui/Loading';
import NavBar from '../components/Navbar';

export default function OrdersPage() {
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock orders data - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockOrders = [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 85000,
          items: [
            { name: 'Blue Mist Granite Slabs', quantity: 2, price: 35000 },
            { name: 'Royal Grey Granite Steps', quantity: 1, price: 15000 }
          ],
          shippingAddress: '123 Main St, Mumbai, Maharashtra 400001',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          status: 'shipped',
          total: 45000,
          items: [
            { name: 'Marble Tiles Premium', quantity: 3, price: 15000 }
          ],
          shippingAddress: '456 Oak Ave, Delhi, Delhi 110001',
          estimatedDelivery: '2024-01-18',
          trackingNumber: 'TRK987654321'
        },
        {
          id: 'ORD-003',
          date: '2024-01-05',
          status: 'processing',
          total: 125000,
          items: [
            { name: 'Quartz Surfaces Premium', quantity: 5, price: 25000 }
          ],
          shippingAddress: '789 Pine St, Bangalore, Karnataka 560001',
          estimatedDelivery: '2024-01-25',
          trackingNumber: null
        }
      ];
      
      setOrders(mockOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar user={user} onLogout={logout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <ErrorMessage error={error} onRetry={loadOrders} />
        )}

        {!loading && orders.length === 0 && (
          <EmptyState
            title="No orders found"
            description="You haven't placed any orders yet. Start shopping to see your orders here."
            actionLabel="Start Shopping"
            onAction={() => window.location.href = '/'}
          />
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Information</h4>
                        <p className="text-sm text-gray-600">
                          Expected: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Download Invoice
                        </button>
                      )}
                      
                      {order.trackingNumber && (
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Track Package
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order #{order.id}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order Date:</span>
                  <span className="ml-2 font-medium">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{order.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium">₹{order.total.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="ml-2 font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Items Ordered</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Shipping Information</h4>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-900">{order.shippingAddress}</p>
                {order.trackingNumber && (
                  <p className="text-sm text-gray-600 mt-1">
                    Tracking Number: {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}