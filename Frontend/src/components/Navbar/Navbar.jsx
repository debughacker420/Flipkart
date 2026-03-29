import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
  Menu,
} from 'lucide-react';
import { accountMenuItems } from '../../constants/accountMenu';
import { logout, openLoginModal } from '../../redux/authSlice';
import { selectCartCount } from '../../redux/cartSlice';
import { selectWishlistCount } from '../../redux/wishlistSlice';
import CategoryStrip from './CategoryStrip';

// ── Flipkart Logo SVG ─────────────────────────────────────────
function FlipkartLogo() {
  return (
    <Link to="/" className="flex items-center gap-1 shrink-0 select-none">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="13" width="28" height="18" rx="2.5" fill="#FFD700"/>
        <path d="M10.5 13V10A6.5 6.5 0 0123.5 10v3" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="17" y="26" textAnchor="middle" fill="#2874F0" fontWeight="900" fontSize="12" fontStyle="italic" fontFamily="Arial,sans-serif">F</text>
      </svg>
      <span className="font-black italic text-[22px] text-[#2874F0] leading-none tracking-tight">
        flipkart
      </span>
      <span className="text-[#FFD700] text-[11px] font-black -mt-4 leading-none">✦</span>
    </Link>
  );
}

// ── Location Modal ────────────────────────────────────────────
function LocationModal({ onClose, onSave }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!/^\d{6}$/.test(input)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    onSave({ pincode: input, city: '' });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state || 'India';
          const pincode = addr.postcode || '';
          onSave({ city, pincode });
        } catch {
          setGeoError('Could not fetch location details. Please enter pincode manually.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setGeoError('Location access denied. Please allow location or enter pincode.');
        else setGeoError('Unable to detect location. Please enter pincode manually.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#2874F0] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Choose your delivery location</p>
            <p className="text-blue-200 text-xs mt-0.5">Enter pincode or detect automatically</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Detect Location Button */}
          <button
            onClick={handleUseLocation}
            disabled={geoLoading}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#2874F0] text-[#2874F0] font-bold py-2.5 rounded-sm text-sm hover:bg-blue-50 transition disabled:opacity-60"
          >
            <MapPin className="w-4 h-4" />
            {geoLoading ? 'Detecting location...' : 'Use My Current Location'}
          </button>
          {geoError && <p className="text-red-500 text-xs -mt-2">{geoError}</p>}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Enter Pincode</label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={input}
              onChange={(e) => { setInput(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. 400001"
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition"
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#FB641B] hover:bg-orange-600 text-white font-bold py-3 rounded-sm transition text-sm uppercase tracking-wide"
          >
            Apply
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincode, setPincode] = useState(() => localStorage.getItem('flipkart_pincode') || '');
  const [locationCity, setLocationCity] = useState(() => localStorage.getItem('flipkart_city') || '');

  const userFirstName = user?.name?.split(' ')[0] || 'Account';
  const deliverLabel = locationCity || (pincode ? pincode : 'Select location');

  // Show location modal after login if location not set
  useEffect(() => {
    if (isAuthenticated && !pincode && !locationCity) {
      const t = setTimeout(() => setShowLocationModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated]);

  const handleSaveLocation = ({ city, pincode: code }) => {
    if (city) {
      setLocationCity(city);
      localStorage.setItem('flipkart_city', city);
    }
    if (code) {
      setPincode(code);
      localStorage.setItem('flipkart_pincode', code);
    }
    setShowLocationModal(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleAccountItemClick = (item) => {
    setIsAccountOpen(false);
    setIsMobileMenuOpen(false);
    if (item.isLogout) {
      dispatch(logout());
      setPincode('');
      setLocationCity('');
      localStorage.removeItem('flipkart_pincode');
      localStorage.removeItem('flipkart_city');
      navigate('/');
      return;
    }
    navigate(item.to);
    if (!isAuthenticated) {
      dispatch(openLoginModal('login'));
    }
  };

  return (
    <>
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSave={handleSaveLocation}
        />
      )}

      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">

        {/* ── MAIN BAR ── */}
        <div className="max-w-[1360px] mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-3 sm:gap-4 h-14 sm:h-16">

            {/* Logo */}
            <FlipkartLogo />

            {/* Location (desktop only) */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden lg:flex items-center gap-1 text-[13px] text-gray-600 hover:text-[#2874F0] transition shrink-0"
            >
              <MapPin className="w-4 h-4 text-[#2874F0]" />
              <span className="text-gray-500">Deliver to</span>
              <span className="font-semibold text-[#2874F0]">
                {deliverLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2874F0]" />
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2874F0] transition pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search for Products, Brands and More"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 sm:h-11 rounded-lg bg-[#F0F5FF] border border-transparent pl-9 sm:pl-10 pr-3 text-sm outline-none focus:border-[#2874F0] focus:bg-white transition placeholder:text-gray-400"
              />
            </form>

            {/* ── Desktop right actions ── */}
            <div className="hidden sm:flex items-center gap-1 lg:gap-2">

              {/* Account dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsAccountOpen(true)}
                onMouseLeave={() => setIsAccountOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) dispatch(openLoginModal('login'));
                    else setIsAccountOpen((v) => !v);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[11px] text-gray-500 leading-none">
                      {isAuthenticated ? 'Welcome' : 'Login'}
                    </p>
                    <p className="text-[13px] font-semibold text-gray-900 mt-0.5 flex items-center gap-0.5">
                      {isAuthenticated ? userFirstName : 'Account'}
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
                    </p>
                  </div>
                </button>

                {/* Account dropdown panel */}
                {isAccountOpen && (
                  <div className="absolute right-0 top-full z-50 w-72 pt-2">
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-[#f5f9ff] to-[#eef5ff] px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">
                              {isAuthenticated ? 'Your Account' : 'New customer?'}
                            </p>
                            <p className="text-[15px] font-bold text-gray-900 mt-0.5">
                              {isAuthenticated ? user?.name : 'Create an account'}
                            </p>
                          </div>
                          {!isAuthenticated && (
                            <button
                              onClick={() => { setIsAccountOpen(false); dispatch(openLoginModal('signup')); }}
                              className="text-xs font-bold text-[#2874F0] hover:underline"
                            >
                              Sign Up
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {accountMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.label}
                              onClick={() => handleAccountItemClick(item)}
                              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                                item.isLogout
                                  ? 'text-red-500 hover:bg-red-50'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="flex-1 text-left">{item.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Become a Seller (desktop only) */}
              <button className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition">
                <Store className="w-4 h-4 text-gray-600" />
                <span className="text-[13px] font-medium text-gray-800">Seller</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  if (!isAuthenticated) dispatch(openLoginModal('login'));
                  else navigate('/account/wishlist');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition relative"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#FF6161] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[13px] font-semibold text-gray-800">Wishlist</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  if (!isAuthenticated) dispatch(openLoginModal('login'));
                  else navigate('/cart');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#FF6161] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[13px] font-semibold text-gray-800">Cart</span>
              </button>
            </div>

            {/* ── Mobile right actions ── */}
            <div className="flex sm:hidden items-center gap-1">
              {/* Cart */}
              <button 
                onClick={() => {
                  if (!isAuthenticated) dispatch(openLoginModal('login'));
                  else navigate('/cart');
                }} 
                className="relative p-2 rounded-xl hover:bg-gray-50 transition"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#FF6161] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Hamburger menu */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-2 rounded-xl hover:bg-gray-50 transition"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU DRAWER ── */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
            {/* Location */}
            <button
              onClick={() => { setShowLocationModal(true); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm border-b border-gray-50"
            >
              <MapPin className="w-4 h-4 text-[#2874F0] shrink-0" />
              <span className="text-gray-500">Deliver to</span>
              <span className="font-semibold text-[#2874F0]">{deliverLabel}</span>
            </button>

            {/* User info or Login prompt */}
            {isAuthenticated ? (
              <div className="px-4 py-3 bg-gradient-to-r from-[#f5f9ff] to-[#eef5ff] border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => { dispatch(openLoginModal('login')); setIsMobileMenuOpen(false); }}
                  className="w-full bg-[#2874F0] text-white font-bold py-2.5 rounded-xl text-sm"
                >
                  Login / Sign Up
                </button>
              </div>
            )}

            {/* Account menu items */}
            <div className="py-1 max-h-[60vh] overflow-y-auto">
              {accountMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleAccountItemClick(item)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                      item.isLogout ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Strip */}
        <CategoryStrip />
      </header>
    </>
  );
}
