import api from './api.js';

// ==================== ENHANCED AUTHENTICATION SERVICES ====================
export const authService = {
  // Login user with full profile data
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user with tier assignment
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user profile with tier info
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Server logout failed, clearing local data:', error);
      return { success: true };
    }
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/auth/delete-account');
    return response.data;
  },
};

// ==================== ENHANCED GRANITE PRODUCT SERVICES ====================
export const graniteService = {
  // Get granite variants (main categories like Blue Mist, Royal Grey)
  getVariants: async (params = {}) => {
    const response = await api.get('/granite/variants', { params });
    return response.data;
  },

  // Get single variant
  getVariant: async (id) => {
    const response = await api.get(`/granite/variants/${id}`);
    return response.data;
  },

  // Get specific variants (e.g., Blue Mist Royal, Blue Mist Classic)
  getSpecificVariants: async (params = {}) => {
    const response = await api.get('/granite/specific-variants', { params });
    return response.data;
  },

  // Get specific variant by ID
  getSpecificVariant: async (id) => {
    const response = await api.get(`/granite/specific-variants/${id}`);
    return response.data;
  },

  // Get specific variants by parent variant
  getSpecificVariantsByVariant: async (variantId) => {
    const response = await api.get(`/granite/specific-variants/by-variant/${variantId}`);
    return response.data;
  },

  // Get products (actual purchasable items)
  getProducts: async (params = {}) => {
    const response = await api.get('/granite/products', { params });
    return response.data;
  },

  // Get single product with full details
  getProduct: async (id) => {
    const response = await api.get(`/granite/products/${id}`);
    return response.data;
  },

  // Get products by specific variant
  getProductsBySpecificVariant: async (specificVariantId, params = {}) => {
    const response = await api.get(`/granite/specific-variants/${specificVariantId}/products`, { params });
    return response.data;
  },

  // Search products with advanced filters
  searchProducts: async (query, filters = {}) => {
    const params = { q: query, ...filters };
    const response = await api.get('/granite/search', { params });
    return response.data;
  },

  // Get utility data
  getCategories: async () => {
    const response = await api.get('/granite/categories');
    return response.data;
  },

  getColors: async () => {
    const response = await api.get('/granite/colors');
    return response.data;
  },

  getFinishes: async () => {
    const response = await api.get('/granite/finishes');
    return response.data;
  },

  getThicknesses: async () => {
    const response = await api.get('/granite/thicknesses');
    return response.data;
  },

  // Check variant dependencies before deletion (admin)
  checkVariantDependencies: async (variantId) => {
    const response = await api.get(`/granite/variants/${variantId}/dependencies`);
    return response.data;
  },

  // Check specific variant dependencies (admin)
  checkSpecificVariantDependencies: async (specificVariantId) => {
    const response = await api.get(`/granite/specific-variants/${specificVariantId}/dependencies`);
    return response.data;
  },

  // Get hierarchy information
  getHierarchyInfo: async () => {
    const response = await api.get('/granite/hierarchy');
    return response.data;
  },
};

// ==================== ENHANCED BUSINESS LOGIC SERVICES ====================
export const businessLogicService = {
  // Calculate cart with business logic (filler pieces, weight, etc.)
  calculateCart: async (cartItems) => {
    const response = await api.post('/granite/calculate-cart', { cartItems });
    return response.data;
  },

  // Check shipping weight limits
  checkShippingWeight: async (cartItems) => {
    const response = await api.post('/granite/check-shipping-weight', { cartItems });
    return response.data;
  },

  // Get available product sizes
  getProductSizes: async (productId) => {
    const response = await api.get(`/granite/products/${productId}/sizes`);
    return response.data;
  },

  // Get business configuration
  getBusinessConfig: async () => {
    const response = await api.get('/granite/business-config');
    return response.data;
  },

  // Calculate pricing for specific quantities
  calculatePricing: async (productId, crateQty, pieceQty) => {
    const response = await api.post('/granite/calculate-pricing', {
      productId,
      crateQty,
      pieceQty
    });
    return response.data;
  },
};

// ==================== ENHANCED CART SERVICES ====================
export const cartService = {
  // Get user's cart with full business logic calculations
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart with crate/piece quantities
  addToCart: async (variantTypeId, crateQty = 0, pieceQty = 0, metadata = {}) => {
    const response = await api.post('/cart/add', {
      variantTypeId,
      crateQty,
      pieceQty,
      metadata
    });
    return response.data;
  },

  // Update cart item with new quantities
  updateCartItem: async (variantTypeId, crateQty, pieceQty) => {
    const response = await api.put('/cart/update', {
      variantTypeId,
      crateQty,
      pieceQty
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (variantTypeId) => {
    const response = await api.delete(`/cart/remove/${variantTypeId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Reserve cart for checkout
  reserveForCheckout: async (timeoutMinutes = 5) => {
    const response = await api.post('/cart/reserve', { timeoutMinutes });
    return response.data;
  },

  // Release cart reservation
  releaseReservation: async () => {
    const response = await api.post('/cart/release');
    return response.data;
  },

  // Get cart summary with business calculations
  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },

  // Validate cart before checkout
  validateCart: async () => {
    const response = await api.post('/cart/validate');
    return response.data;
  },
};

// ==================== ENHANCED ORDER SERVICES ====================
export const orderService = {
  // Get user's orders with pagination
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  // Create new order from cart
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID with full details
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (limited to user-allowed statuses)
  updateOrderStatus: async (id, status, reason = '') => {
    const response = await api.put(`/orders/${id}/status`, { status, reason });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason = '') => {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get order tracking info
  getOrderTracking: async (id) => {
    const response = await api.get(`/orders/${id}/tracking`);
    return response.data;
  },

  // Request order modification
  requestModification: async (id, modifications) => {
    const response = await api.post(`/orders/${id}/modify`, modifications);
    return response.data;
  },
};

// ==================== ENHANCED INVOICE SERVICES ====================
export const invoiceService = {
  // Get user's invoices
  getMyInvoices: async (params = {}) => {
    const response = await api.get('/invoices/my-invoices', { params });
    return response.data;
  },

  // Get invoice by ID
  getInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Download invoice PDF
  downloadInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate invoice for order
  generateInvoice: async (orderId) => {
    const response = await api.post(`/invoices/generate/${orderId}`);
    return response.data;
  },

  // Get invoice status
  getInvoiceStatus: async (id) => {
    const response = await api.get(`/invoices/${id}/status`);
    return response.data;
  },
};

// ==================== TIER SERVICES ====================
export const tierService = {
  // Get all tiers
  getTiers: async () => {
    const response = await api.get('/tiers');
    return response.data;
  },

  // Get tier details
  getTier: async (tier) => {
    const response = await api.get(`/tiers/${tier}`);
    return response.data;
  },

  // Get user's effective discount
  getUserDiscount: async () => {
    const response = await api.get('/tiers/my-discount');
    return response.data;
  },
};

// ==================== USER MANAGEMENT SERVICES ====================
export const userService = {
  // Get user profile with tier info
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Get user's order history
  getOrderHistory: async (params = {}) => {
    const response = await api.get('/users/orders', { params });
    return response.data;
  },

  // Get user's invoice history
  getInvoiceHistory: async (params = {}) => {
    const response = await api.get('/users/invoices', { params });
    return response.data;
  },

  // Request tier upgrade
  requestTierUpgrade: async (requestData) => {
    const response = await api.post('/users/request-tier-upgrade', requestData);
    return response.data;
  },
};

// ==================== ANALYTICS SERVICES ====================
export const analyticsService = {
  // Get user dashboard data
  getDashboardData: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/orders', { params });
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/products', { params });
    return response.data;
  },
};

// ==================== UPLOAD SERVICES ====================
export const uploadService = {
  // Upload single file
  uploadFile: async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple files
  uploadFiles: async (files, type = 'image') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileUrl) => {
    const response = await api.delete('/upload/delete', {
      data: { fileUrl }
    });
    return response.data;
  },
};

// ==================== SETTINGS SERVICES ====================
export const settingsService = {
  // Get app settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Get specific setting
  getSetting: async (key) => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },
};

// ==================== HEALTH & UTILITY SERVICES ====================
export const healthService = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get system status
  getSystemStatus: async () => {
    const response = await api.get('/health/status');
    return response.data;
  },
};

// Export all services
export default {
  auth: authService,
  granite: graniteService,
  businessLogic: businessLogicService,
  cart: cartService,
  order: orderService,
  invoice: invoiceService,
  tier: tierService,
  user: userService,
  analytics: analyticsService,
  upload: uploadService,
  settings: settingsService,
  health: healthService,
};