import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCart } from "../context/EnhancedCartContext";
import LoginPrompt from "./LoginPrompt";
import CartPopup from "./LoginPrompt";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart() || {};
  const itemCount = getItemCount ? getItemCount() : 0;
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleProductsClick(e) {
    e.preventDefault();
    if (location.pathname === "/") {
      const section = document.getElementById("products-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { replace: false });
      setTimeout(() => {
        const section = document.getElementById("products-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function handleCartClick(e) {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    navigate("/cart");
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RR</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              RR STONES
              <div className="text-xs font-normal text-slate-500 -mt-1">Professional Solutions</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Home
            </Link>
            <button
              onClick={handleProductsClick}
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Products
            </button>
            <Link 
              to="/about-us" 
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button 
              onClick={handleCartClick} 
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m-7 4a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            {!user ? (
              <Link
                to="/login"
                className="business-button-primary text-sm"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-700 font-medium text-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">{user.name}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-slate-100">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Profile Settings
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      My Orders
                    </Link>
                    <div className="border-t border-slate-100 my-2"></div>
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={(e) => {
                  handleProductsClick(e);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Products
              </button>
              <Link 
                to="/about-us" 
                className="block px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </div>

      {showLoginPrompt && <CartPopup onClose={() => setShowLoginPrompt(false)} />}
    </nav>
  );
};

export default Navbar;
