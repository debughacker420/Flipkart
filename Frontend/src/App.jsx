import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCart } from './redux/cartSlice';
import { fetchProfile } from './redux/authSlice';
import { fetchWishlist } from './redux/wishlistSlice';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LoginModal from './components/Auth/LoginModal';

// Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AccountPlaceholderPage from './pages/AccountPlaceholderPage';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';

// Embedded Route Navigational Scroll Utility Constraints
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  // Load cart from backend on app mount for navbar badge
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-flipbg flex flex-col relative w-full overflow-x-hidden font-sans text-flipprimary">
      
      {/* Scroll Logic Matrix */}
      <ScrollToTop />
      
      {/* Application Global Notifications Engine Override */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '2px',
            background: '#333',
            color: '#fff',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#388E3C', // flipgreen
              secondary: '#fff',
            },
          },
        }} 
      />

      {/* Persistent Global Header */}
      <Navbar />
      <LoginModal />
      
      {/* Route Render Output Constraints */}
      <main className="w-full h-full flex-grow">
        <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/products" element={<ProductListing />} />
           <Route path="/product/:id" element={<ProductDetail />} />
           <Route path="/cart" element={<Cart />} />
           <Route path="/checkout" element={<Checkout />} />
           <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
           <Route path="/account/profile" element={<AccountPlaceholderPage />} />
           <Route path="/account/plus" element={<AccountPlaceholderPage />} />
           <Route path="/account/orders" element={<OrderHistory />} />
           <Route path="/account/wishlist" element={<Wishlist />} />
           <Route path="/account/rewards" element={<AccountPlaceholderPage />} />
           <Route path="/account/gift-cards" element={<AccountPlaceholderPage />} />
           <Route path="/account/coupons" element={<AccountPlaceholderPage />} />
           <Route path="/account/cards" element={<AccountPlaceholderPage />} />
           <Route path="/account/addresses" element={<AccountPlaceholderPage />} />
           <Route path="/account/notifications" element={<AccountPlaceholderPage />} />
        </Routes>
      </main>
      
      {/* Persistent Global Footer */}
      <Footer />
      
    </div>
  );
}
