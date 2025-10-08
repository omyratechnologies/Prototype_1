import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/EnhancedCartContext';
import { ToastProvider } from './context/ToastContext';
import { OnlineStatusProvider } from './context/OnlineStatusContext';
import ErrorBoundary from './components/ErrorBoundary';

// Original Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProductTypesPage from './pages/ProductTypesPage';
import VarietiesPage from './pages/VarietiesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import InvoicePage from './pages/InvoicePage';
import ProfilePage from './pages/ProfilePage';

// Enhanced Pages
import EnhancedProductDetailPage from './pages/EnhancedProductDetailPage';
import EnhancedCartPage from './pages/EnhancedCartPage';

// CSS
import './App.css';

// Enhanced App with comprehensive error handling and context providers
function App() {
  return (
    <ErrorBoundary>
      <OnlineStatusProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="App min-h-screen bg-gray-50">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Product Navigation Routes */}
                    <Route path="/products" element={<ProductTypesPage />} />
                    <Route path="/products/:categoryId" element={<VarietiesPage />} />
                    <Route path="/products/:categoryId/:typeId" element={<VarietiesPage />} />
                    
                    {/* Enhanced Product Detail Routes */}
                    <Route path="/products/detail/:productId" element={<EnhancedProductDetailPage />} />
                    <Route path="/products/:categoryId/:typeId/:varietyId" element={<EnhancedProductDetailPage />} />
                    
                    {/* Cart Routes - Supporting both original and enhanced */}
                    <Route path="/cart" element={<EnhancedCartPage />} />
                    <Route path="/cart/original" element={<CartPage />} />
                    
                    {/* Checkout and Order Routes */}
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/invoices" element={<InvoicePage />} />
                    <Route path="/invoices/:id" element={<InvoicePage />} />
                    
                    {/* User Profile Routes */}
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Catch-all Route for 404s */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </OnlineStatusProvider>
    </ErrorBoundary>
  );
}

// Enhanced 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-4">
            <a
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go Home
            </a>
            <div>
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;