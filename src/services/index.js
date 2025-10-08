import api from './api.js';

// Authentication services
export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
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

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/auth/delete-account');
    return response.data;
  },
};

// Product services
export const productService = {
  // Get all products with pagination and filters
  getProducts: async (params = {}) => {
    const response = await api.get('/granite/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id) => {
    const response = await api.get(`/granite/products/${id}`);
    return response.data;
  },

  // Get all variants
  getVariants: async () => {
    const response = await api.get('/granite/variants');
    return response.data;
  },

  // Get single variant
  getVariant: async (id) => {
    const response = await api.get(`/granite/variants/${id}`);
    return response.data;
  },

  // Get specific variants
  getSpecificVariants: async () => {
    const response = await api.get('/granite/specific-variants');
    return response.data;
  },

  // Get specific variant by ID
  getSpecificVariant: async (id) => {
    const response = await api.get(`/granite/specific-variants/${id}`);
    return response.data;
  },

  // Get specific variants by variant ID
  getSpecificVariantsByVariant: async (variantId) => {
    const response = await api.get(`/granite/specific-variants/by-variant/${variantId}`);
    return response.data;
  },

  // Get products by specific variant
  getProductsBySpecificVariant: async (specificVariantId) => {
    const response = await api.get(`/granite/specific-variants/${specificVariantId}/products`);
    return response.data;
  },

  // Search products
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
};

// Cart services
export const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Get cart summary
  getCartSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  },

  // Start checkout process
  startCheckout: async () => {
    const response = await api.post('/cart/checkout');
    return response.data;
  },

  // Cancel checkout
  cancelCheckout: async () => {
    const response = await api.post('/cart/checkout/cancel');
    return response.data;
  },
};

// Order services
export const orderService = {
  // Get user's orders
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
};

// Invoice services
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
};

// Tier services
export const tierService = {
  // Get all tiers
  getTiers: async () => {
    const response = await api.get('/tiers');
    return response.data;
  },
};