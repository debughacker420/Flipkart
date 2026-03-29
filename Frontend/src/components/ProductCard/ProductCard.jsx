import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../utils/formatPrice';
import { addWishlistItem, removeWishlistItem, selectIsWishlisted } from '../../redux/wishlistSlice';
import { openLoginModal } from '../../redux/authSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isWishlisted = useSelector(selectIsWishlisted(product?.id));

  if (!product) return null;

  const { id, title, image, price, mrp, rating = '0.0', reviewsCount = 0, stock } = product;
  const outOfStock = stock === 0;
  const discount = calculateDiscount(price, mrp);

  const handleCardClick = () => navigate(`/product/${id}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openLoginModal('login'));
      toast('Please login to add items to cart');
      return;
    }
    if (!outOfStock && onAddToCart) {
      onAddToCart(id);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(openLoginModal('login'));
      toast('Please login to save to wishlist');
      return;
    }
    if (isWishlisted) {
      dispatch(removeWishlistItem(id));
      toast('Removed from wishlist');
    } else {
      dispatch(addWishlistItem(id));
      toast.success('Added to wishlist!');
    }
  };

  return (
    <div
      className="w-full min-w-[130px] max-w-[220px] h-full bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl flex flex-col border border-gray-100/50 hover:border-blue-100 overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="h-48 relative overflow-hidden flex items-center justify-center p-2 bg-white">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-gray-100/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="text-flipsecondary font-bold text-sm bg-white px-3 py-1.5 rounded-sm shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Add to Cart Hover Button */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 w-full h-8 bg-flipyellow text-white text-xs font-bold flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-all duration-200 z-20"
          >
            <ShoppingCart className="w-[14px] h-[14px]" />
            ADD TO CART
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 pt-2 flex flex-col">
        <h3 className="text-sm line-clamp-2 text-flipprimary mb-1.5 leading-[1.3] min-h-[36px]">{title}</h3>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-2">
          {rating ? (
            <span className="bg-flipgreen text-white text-[11px] px-2 py-0.5 rounded-md flex items-center font-bold leading-none">
              {rating} <Star className="w-[10px] h-[10px] fill-white ml-[3px]" />
            </span>
          ) : null}
          <span className="text-flipsecondary text-[11px] font-medium tracking-wide">
            ({Number(reviewsCount).toLocaleString('en-IN')})
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline flex-wrap">
          <span className="text-base font-bold text-flipprimary mr-2 leading-none">{formatPrice(price)}</span>
          {mrp > price && (
            <>
              <span className="text-[13px] text-flipsecondary line-through leading-none">{formatPrice(mrp)}</span>
              <span className="text-[13px] text-flipgreen font-medium ml-2 leading-none">{discount}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
