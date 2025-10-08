import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/EnhancedCartContext";
import ToastProvider from "./context/ToastContext";
import OnlineStatusProvider from "./context/OnlineStatusContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductTypesPage from "./pages/ProductTypesPage";
import EnhancedProductDetailPage from "./pages/EnhancedProductDetailPage";
import VarietiesPage from "./pages/VarietiesPage";
import EnhancedCartPage from "./pages/EnhancedCartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import InvoicePage from "./pages/InvoicePage";
import Invoice from "./pages/Invoice";

function App() {

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <OnlineStatusProvider>
            <CartProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/invoice" element={<InvoicePage />} />

                  <Route path="/products/:slug" element={<ProductTypesPage />} />
                  <Route path="/products/:categoryId/:typeId" element={<VarietiesPage />} />
                  <Route path="/products/:categoryId/:typeId/:varietyId" element={<EnhancedProductDetailPage />} />

                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/cart" element={<EnhancedCartPage />} />
                  <Route path="/legacy-invoice" element={<Invoice />} />
                </Routes>
              </Router>
            </CartProvider>
          </OnlineStatusProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
