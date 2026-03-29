import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  clearAuthError,
  closeLoginModal,
  login,
  register,
  switchModalMode,
} from '../../redux/authSlice';

const initialLoginForm = { email: '', password: '' };
const initialSignupForm = { name: '', email: '', phone: '', password: '' };

export default function LoginModal() {
  const dispatch = useDispatch();
  const { isLoginModalOpen, modalMode, loading, error } = useSelector((state) => state.auth);

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [signupForm, setSignupForm] = useState(initialSignupForm);

  useEffect(() => {
    if (!isLoginModalOpen) return undefined;
    const handleEscape = (e) => { if (e.key === 'Escape') dispatch(closeLoginModal()); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', handleEscape); };
  }, [dispatch, isLoginModalOpen]);

  useEffect(() => {
    if (!isLoginModalOpen) { setLoginForm(initialLoginForm); setSignupForm(initialSignupForm); }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const isLogin = modalMode === 'login';

  const handleModeChange = (mode) => { dispatch(clearAuthError()); dispatch(switchModalMode(mode)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await dispatch(login(loginForm)).unwrap();
        toast.success('Login successful!');
      } else {
        await dispatch(register(signupForm)).unwrap();
        toast.success('Account created successfully!');
      }
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="relative flex w-full max-w-[850px] overflow-hidden rounded-sm bg-white shadow-2xl" style={{ minHeight: 480 }}>

        {/* Close button */}
        <button
          type="button"
          onClick={() => dispatch(closeLoginModal())}
          className="absolute right-3 top-3 z-10 text-white/70 hover:text-white transition md:text-gray-400 md:hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-[38%] flex-col justify-between bg-[#2874f0] px-8 py-10 text-white shrink-0">
          <div>
            <h2 className="text-[28px] font-bold leading-snug mt-2">
              {isLogin ? 'Login' : 'Looks like you are new here!'}
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-blue-100">
              {isLogin
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your email to get started'}
            </p>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center py-6">
            <svg width="180" height="160" viewBox="0 0 180 160" fill="none">
              <ellipse cx="90" cy="145" rx="70" ry="8" fill="rgba(255,255,255,0.12)" />
              {/* Shopping bag */}
              <rect x="45" y="65" width="90" height="70" rx="6" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" />
              <path d="M65 65V52a25 25 0 0150 0v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Handle */}
              <rect x="72" y="88" width="36" height="4" rx="2" fill="white" fillOpacity="0.6" />
              {/* Stars */}
              <text x="78" y="82" fill="#FFD700" fontSize="18" fontWeight="bold">★</text>
              <text x="20" y="50" fill="white" fillOpacity="0.4" fontSize="22">★</text>
              <text x="148" y="80" fill="white" fillOpacity="0.3" fontSize="16">★</text>
              <text x="35" y="120" fill="white" fillOpacity="0.2" fontSize="12">★</text>
            </svg>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col px-7 py-8 sm:px-10 bg-white overflow-y-auto">
          {/* Mobile heading */}
          <div className="md:hidden mb-4">
            <h2 className="text-xl font-bold text-gray-900">{isLogin ? 'Login' : 'Create Account'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? 'Get access to your Orders, Wishlist and Recommendations' : 'Sign up with your email to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm(s => ({ ...s, name: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-[#2874f0] transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter Email"
                value={isLogin ? loginForm.email : signupForm.email}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isLogin) setLoginForm(s => ({ ...s, email: v }));
                  else setSignupForm(s => ({ ...s, email: v }));
                }}
                className="w-full h-12 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-[#2874f0] transition"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm(s => ({ ...s, phone: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-[#2874f0] transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder={isLogin ? 'Enter your password' : 'Create a password (min. 6 characters)'}
                value={isLogin ? loginForm.password : signupForm.password}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isLogin) setLoginForm(s => ({ ...s, password: v }));
                  else setSignupForm(s => ({ ...s, password: v }));
                }}
                className="w-full h-12 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-[#2874f0] transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500 leading-5">
              By continuing, you agree to Flipkart's{' '}
              <span className="text-[#2874f0] cursor-pointer">Terms of Use</span> and{' '}
              <span className="text-[#2874f0] cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#fb641b] hover:bg-[#f05b10] text-white font-bold text-[15px] rounded-sm transition disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Continue'}
            </button>
          </form>

          <div className="mt-auto pt-6 text-center">
            <button
              type="button"
              onClick={() => handleModeChange(isLogin ? 'signup' : 'login')}
              className="text-[14px] text-[#2874f0] font-bold hover:underline"
            >
              {isLogin ? 'New to Flipkart? Create an account' : 'Existing User? Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
