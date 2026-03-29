import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchWishlist, removeWishlistItem } from '../redux/wishlistSlice';
import { addItemToCart } from '../redux/cartSlice';
import { formatPrice, calculateDiscount } from '../utils/formatPrice';
import { openLoginModal } from '../redux/authSlice';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openLoginModal('login'));
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  const handleRemove = (productId) => {
    dispatch(removeWishlistItem(productId));
    toast('Removed from wishlist');
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addItemToCart({ productId, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Heart className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Please login to view your Wishlist</h2>
        <button
          onClick={() => dispatch(openLoginModal('login'))}
          className="bg-[#2874f0] text-white font-bold px-8 py-3 rounded-sm text-sm hover:bg-blue-700 transition"
        >
          LOGIN
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-4 pb-10 px-4">
      {/* Breadcrumb */}
      <div className="text-xs text-flipsecondary mb-4 flex items-center gap-1">
        <Link to="/" className="hover:text-flipblue">Home</Link>
        <span>›</span>
        <span>My Wishlist</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-[#2874f0]" />
        <h1 className="text-xl font-bold text-flipprimary">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-flipsecondary font-medium">({items.length} items)</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-sm shadow-sm h-72 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm py-16 flex flex-col items-center gap-5 text-center">
          <Heart className="w-20 h-20 text-gray-200" strokeWidth={1.5} />
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">Your wishlist is empty!</h2>
            <p className="text-sm text-gray-500">Save items you love by clicking the ♡ on any product</p>
          </div>
          <Link
            to="/products"
            className="mt-2 bg-[#2874f0] text-white font-bold px-8 py-3 rounded-sm text-sm hover:bg-blue-700 transition"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            const discount = calculateDiscount(item.price, item.mrp);
            return (
              <div
                key={item.productId}
                className="bg-white rounded-sm shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div
                  className="h-44 flex items-center justify-center p-3 bg-white relative"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-500 bg-white border border-red-200 px-2 py-1 rounded-sm">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 border-t border-gray-100">
                  <p
                    className="text-sm text-flipprimary line-clamp-2 mb-2 leading-snug cursor-pointer hover:text-flipblue"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap mb-3">
                    <span className="font-bold text-flipprimary text-sm">{formatPrice(item.price)}</span>
                    {item.mrp > item.price && (
                      <>
                        <span className="text-xs text-flipsecondary line-through">{formatPrice(item.mrp)}</span>
                        <span className="text-xs text-flipgreen font-medium">{discount}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.productId)}
                      disabled={item.stock === 0}
                      className="flex-1 bg-[#ff9f00] hover:bg-yellow-500 text-white font-bold py-2 text-xs rounded-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
                    </button>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="w-9 h-8 flex items-center justify-center border border-gray-200 rounded-sm hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
