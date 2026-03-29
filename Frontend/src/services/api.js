import axios from 'axios';
import { getGuestId } from '../utils/storage';

const AUTH_STORAGE_KEY = 'flipkart_auth';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue)?.token || null : null;
  } catch (_error) {
    return null;
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'x-guest-id': getGuestId(),
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

// Response interceptor — unwrap data and handle retries
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    
    // If config does not exist or retry option is not set, reject
    if (!config || !config.method === 'get') {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return Promise.reject(new Error(message));
    }

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= 3) {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      return Promise.reject(new Error(message));
    }

    // Increase the retry count
    config.__retryCount += 1;

    // Create new promise to handle exponential backoff
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000 * config.__retryCount); // 1s, 2s, 3s backoff
    });

    // Return the promise in which recalls axios to retry the request
    await backoff;
    return api(config);
  }
);

// ── Products ─────────────────────────────────────────────────
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');
export const getProductBrands = (params) => api.get('/products/brands', { params });

// ── Wishlist ─────────────────────────────────────────────────
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post('/wishlist', { productId });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// ── Reviews ──────────────────────────────────────────────────
export const getReviews = (productId) => api.get(`/reviews/${productId}`);
export const addReview = (productId, data) => api.post(`/reviews/${productId}`, data);

// ── Cart ─────────────────────────────────────────────────────
export const getCart = () => api.get('/cart');
export const addToCart = (productId, qty = 1) => api.post('/cart', { productId, quantity: qty });
export const updateCartItem = (cartItemId, qty) => api.put(`/cart/${cartItemId}`, { quantity: qty });
export const removeCartItem = (cartItemId) => api.delete(`/cart/${cartItemId}`);

// ── Orders ───────────────────────────────────────────────────
export const placeOrder = (addressId, paymentMethod = 'COD') =>
  api.post('/orders', { addressId, paymentMethod });
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);

// ── Addresses ────────────────────────────────────────────────
export const getAddresses = () => api.get('/addresses');
export const addAddress = (data) => api.post('/addresses', data);

// ── Authentication ──────────────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

export default api;
