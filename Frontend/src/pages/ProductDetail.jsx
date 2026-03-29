import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/productSlice';
import { addItemToCart } from '../redux/cartSlice';
import { addWishlistItem, removeWishlistItem, selectIsWishlisted } from '../redux/wishlistSlice';
import { openLoginModal } from '../redux/authSlice';
import { getReviews, addReview } from '../services/api';
import ImageCarousel from '../components/ImageCarousel/ImageCarousel';
import { formatPrice, calculateDiscount, formatDate } from '../utils/formatPrice';
import { Heart, MapPin, Star, Tag, Truck, X, Camera } from 'lucide-react';
import ErrorState from '../components/ErrorState/ErrorState';
import toast from 'react-hot-toast';

// ── Star Rating Input ─────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition"
        >
          <Star
            className={`w-7 h-7 ${(hover || value) >= n ? 'fill-[#ff9f00] text-[#ff9f00]' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Write Review Modal ────────────────────────────────────────
function WriteReviewModal({ productId, onClose, onSubmitted }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const fileRef = useRef(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm p-8 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Login to write a review</h3>
          <p className="text-sm text-gray-500 mb-5">You need to be logged in to submit a review.</p>
          <button
            onClick={() => { onClose(); dispatch(openLoginModal('login')); }}
            className="w-full bg-[#2874f0] text-white font-bold py-3 rounded-sm text-sm"
          >
            LOGIN
          </button>
          <button onClick={onClose} className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    );
  }

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      toast('Maximum 3 photos allowed');
      return;
    }
    files.forEach((file) => {
      if (file.size > 1_000_000) {
        toast(`${file.name} is too large (max 1MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      await addReview(productId, { rating, title, body, images: photos });
      toast.success('Review submitted!');
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg my-auto">
        {/* Header */}
        <div className="bg-[#2874f0] px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Write a Review</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-flipprimary mb-2">Your Rating *</label>
            <StarInput value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-flipsecondary mt-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-flipprimary mb-1.5">Review Title</label>
            <input
              type="text"
              placeholder="Summarize your review in one line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] transition"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-bold text-flipprimary mb-1.5">Review Details</label>
            <textarea
              placeholder="Share your experience with this product..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">{body.length}/1000</p>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-bold text-flipprimary mb-1.5">
              Add Photos <span className="text-gray-400 font-normal">(up to 3, max 1MB each)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {photos.map((src, i) => (
                <div key={i} className="relative w-20 h-20 border border-gray-200 rounded-sm overflow-hidden group">
                  <img src={src} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center text-gray-400 hover:border-[#2874f0] hover:text-[#2874f0] transition text-xs gap-1"
                >
                  <Camera className="w-5 h-5" />
                  <span>Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#fb641b] hover:bg-[#f05b10] text-white font-bold py-3 rounded-sm text-sm uppercase tracking-wide transition disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main ProductDetail ────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct: product, loading, error } = useSelector((state) => state.products);
  const isWishlisted = useSelector(selectIsWishlisted(id));
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo(0, 0);
      loadReviews();
    }
  }, [dispatch, id]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviews(id);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal('login'));
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

  if (loading || !product) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-flipbg">
        <div className="w-10 h-10 border-4 border-flipblue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }



  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const title = product.title || product.name || '';
  const discountStr = calculateDiscount(product.price, product.mrp);
  const outOfStock = product.stock === 0;

  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 3);
  const deliveryDateFormatted = formatDate(deliveryDateObj);

  // Compute rating distribution from reviews
  const totalReviews = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const avgRating = totalReviews
    ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : product.rating || '4.2';

  const starColors = { 5: 'bg-green-500', 4: 'bg-green-400', 3: 'bg-yellow-500', 2: 'bg-orange-500', 1: 'bg-red-500' };

  return (
    <>
      {showReviewModal && (
        <WriteReviewModal
          productId={id}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={loadReviews}
        />
      )}

      <div className="w-full max-w-7xl mx-auto pt-2 pb-10 flex flex-col">
        {/* Breadcrumb */}
        <div className="text-xs text-flipsecondary mb-2 mx-4 flex items-center gap-1 font-medium tracking-wide">
          <Link to="/" className="hover:text-flipblue">Home</Link>
          <span className="opacity-70">›</span>
          <span className="truncate">{error ? 'Error' : title}</span>
        </div>

        {error && (
          <div className="mx-4 mt-2 mb-6">
            <ErrorState onRetry={() => dispatch(fetchProductById(id))} />
          </div>
        )}

        {!error && (
          <>
            {/* Main Panel */}
        <div className="bg-white flex flex-col md:flex-row mx-4 shadow-sm rounded-sm">

          {/* LEFT */}
          <div className="w-full min-w-0 md:w-[450px] shrink-0 sticky top-[64px] self-start border-r border-transparent md:border-flipborder flex flex-col p-4 z-10 bg-white">
            <div className="mx-auto relative w-full">
              <ImageCarousel images={images} />
              {/* Wishlist on image */}
              <button
                onClick={handleWishlist}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition z-20 border border-gray-100"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-5 h-5 transition ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                />
              </button>
            </div>

            {outOfStock ? (
              <div className="mt-4 px-4 md:px-0">
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-center">
                  <p className="text-red-600 font-bold text-sm uppercase">Out of Stock</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 w-full mt-4 flex-col sm:flex-row px-4 md:px-0">
                <button
                  onClick={() => { dispatch(addItemToCart({ productId: id, quantity: qty })); toast.success('Added to cart! 🛒'); }}
                  className="flex-1 bg-flipyellow text-white font-bold py-3.5 px-4 text-[15px] flex items-center justify-center gap-2 hover:bg-yellow-500 transition rounded-sm shadow-sm"
                >
                  <span className="text-lg">🛒</span> ADD TO CART
                </button>
                <button
                  onClick={() => { dispatch(addItemToCart({ productId: id, quantity: qty })); navigate('/checkout'); }}
                  className="flex-1 bg-fliporange text-white font-bold py-3.5 px-4 text-[15px] flex items-center justify-center gap-2 hover:bg-orange-600 transition rounded-sm shadow-sm mt-2 sm:mt-0"
                >
                  <span className="text-lg">⚡</span> BUY NOW
                </button>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
            <h1 className="text-xl font-medium text-flipprimary leading-snug">{title}</h1>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="bg-flipgreen text-white text-[12px] px-1.5 py-[2px] rounded-sm flex items-center font-bold">
                {product.rating || '4.2'} <Star className="w-[10px] h-[10px] fill-white ml-[3px]" />
              </span>
              <span className="text-flipsecondary text-[13px] font-medium">
                {Number(product.reviewsCount || 0).toLocaleString('en-IN')} Ratings & {reviews.length} Reviews
              </span>
              <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" className="h-[21px] object-contain" alt="Assured" />
            </div>

            {/* Wishlist text button */}
            <button
              onClick={handleWishlist}
              className="mt-3 self-start flex items-center gap-1.5 text-sm text-[#2874f0] hover:underline"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            <div className="text-flipgreen text-sm font-medium mt-4">Special price</div>
            <div className="flex items-baseline gap-3 mt-1 flex-wrap">
              <span className="text-3xl font-bold text-flipprimary">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-flipsecondary line-through ml-2">{formatPrice(product.mrp)}</span>
                  <span className="text-lg text-flipgreen font-bold ml-1">{discountStr}</span>
                </>
              )}
            </div>

            {/* Offers */}
            <div className="mt-5">
              <h3 className="font-bold text-sm text-flipprimary mb-3">Available offers</h3>
              <div className="flex flex-col gap-3">
                {[
                  { text: 'Bank Offer', detail: '5% Cashback on Flipkart Axis Bank Card' },
                  { text: 'Partner Offer', detail: 'Make a purchase and enjoy a surprise cashback/coupon' },
                  { text: 'Combo Offer', detail: 'Buy 2 items save 5%; Buy 3 or more save 10%' },
                ].map(({ text, detail }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Tag className="w-[18px] h-[18px] text-flipgreen shrink-0 mt-[2px]" />
                    <span className="text-sm text-flipprimary">
                      <strong>{text}</strong> {detail}{' '}
                      <span className="text-flipblue font-medium cursor-pointer">T&C</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div className="mt-8 flex gap-8 flex-wrap border-t border-flipborder pt-6">
              <div className="w-[80px] shrink-0 text-flipsecondary text-[14px] font-medium pt-1 hidden md:block">Delivery</div>
              <div className="flex flex-col gap-3 flex-1 max-w-[320px]">
                <div className="flex items-center border-b-2 border-flipblue pb-1 w-full">
                  <MapPin className="w-4 h-4 text-flipblue mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter Delivery Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 outline-none text-sm font-medium text-flipprimary bg-transparent"
                    maxLength={6}
                  />
                  <button className="text-flipblue text-[13px] font-bold uppercase px-2">Check</button>
                </div>
                <div className="flex gap-2">
                  <Truck className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="flex flex-col pl-1">
                    <span className="text-[14px] font-bold text-flipprimary">
                      Delivery by {deliveryDateFormatted} | <span className="text-flipgreen ml-1">Free</span>{' '}
                      <span className="line-through text-flipsecondary text-xs ml-1">₹40</span>
                    </span>
                    <span className="text-[12px] text-flipsecondary mt-1">if ordered before 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8 flex gap-8 flex-wrap">
              <div className="w-[80px] shrink-0 text-flipsecondary text-[14px] font-medium pt-1 hidden md:block">Quantity</div>
              <div className="flex items-center">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg disabled:opacity-50 hover:bg-gray-50">-</button>
                <div className="w-12 h-8 border border-gray-300 mx-3 flex items-center justify-center font-bold text-[15px]">{qty}</div>
                <button onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-50">+</button>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-8 flex flex-col md:flex-row gap-8">
              <div className="w-[80px] shrink-0 text-flipsecondary text-[14px] font-medium pt-1 hidden md:block">Highlights</div>
              <ul className="flex flex-col gap-2.5 list-disc pl-5 md:pl-0 text-sm font-medium text-flipprimary marker:text-gray-400">
                {(product.highlights || [
                  '1 Year Authentic Manufacturer Warranty',
                  'Instant Bank Cashbacks available on Checkout',
                  '10 Days Seamless Replacement Policy',
                  'Cash on Delivery Available across major regions',
                ]).map((hl, i) => <li key={i}>{hl}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Content */}
        <div className="bg-white flex flex-col mx-4 mt-4 shadow-sm rounded-sm mb-4">

          {/* Specifications */}
          <div className="p-6 border-b border-flipborder flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 shrink-0">
              <h2 className="text-[18px] font-bold text-flipprimary">Specifications</h2>
            </div>
            <div className="flex flex-col border border-flipborder rounded-sm overflow-hidden text-sm flex-1">
              {(product.specifications?.length > 0 ? product.specifications : [
                { label: 'Brand', value: product.brand || 'N/A' },
                { label: 'Category', value: product.categoryName || 'N/A' },
              ]).map((spec, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'bg-flipbg' : 'bg-white'}`}>
                  <div className="w-1/3 min-w-[140px] p-3 text-flipsecondary">{spec.label}</div>
                  <div className="w-2/3 p-3 text-flipprimary font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-flipborder flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 shrink-0">
              <h2 className="text-[18px] font-bold text-flipprimary">Description</h2>
            </div>
            <div className="w-full md:w-3/4 text-[14px] text-flipprimary leading-relaxed opacity-90">
              {product.description || 'No description available.'}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-[18px] font-bold text-flipprimary">Ratings & Reviews</h2>
              <button
                onClick={() => setShowReviewModal(true)}
                className="border border-[#2874f0] text-[#2874f0] font-bold px-5 py-2 text-sm rounded-sm hover:bg-blue-50 transition uppercase"
              >
                Rate Product
              </button>
            </div>

            {/* Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex flex-col items-center shrink-0">
                <div className="text-[40px] font-bold text-flipprimary flex items-baseline leading-none">
                  {avgRating} <Star className="w-[22px] h-[22px] fill-flipprimary ml-1" />
                </div>
                <div className="text-sm text-flipsecondary mt-2 text-center font-medium">
                  {totalReviews > 0 ? `${totalReviews} Reviews` : `${Number(product.reviewsCount || 0).toLocaleString('en-IN')} Ratings`}
                </div>
              </div>

              {totalReviews > 0 && (
                <div className="w-full max-w-[260px] flex flex-col gap-1">
                  {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3 text-sm font-medium">
                      <span className="w-4 text-right">{star}</span>
                      <Star className="w-3 h-3 fill-black" />
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${starColors[star]}`}
                          style={{ width: totalReviews ? `${(count / totalReviews) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="w-6 text-flipsecondary text-[12px] text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-flipblue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="flex flex-col gap-6 mt-2">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-flipborder pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-white text-[11px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5 ${
                        review.rating >= 4 ? 'bg-green-500' : review.rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {review.rating} <Star className="w-[9px] h-[9px] fill-white" />
                      </span>
                      {review.title && <span className="font-bold text-sm text-flipprimary">{review.title}</span>}
                    </div>
                    {review.body && <p className="text-sm text-flipprimary leading-relaxed mb-2">{review.body}</p>}

                    {/* Review photos */}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {review.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Review photo ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-sm border border-gray-200 cursor-pointer hover:opacity-90"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-flipsecondary">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-600 uppercase">
                        {review.userName?.[0] || '?'}
                      </div>
                      <span className="font-medium">{review.userName}</span>
                      <span>·</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-flipsecondary">
                <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">No reviews yet. Be the first to review!</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="mt-4 text-sm font-bold text-[#2874f0] hover:underline"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </>
  );
}
