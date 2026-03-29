import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../redux/productSlice';
import { addItemToCart } from '../redux/cartSlice';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard/ProductCard';
import SkeletonCard from '../components/SkeletonCard/SkeletonCard';
import ErrorState from '../components/ErrorState/ErrorState';
import toast from 'react-hot-toast';

const BANNER_SLIDES = [
  {
    id: 1,
    brand: 'SAMSUNG',
    title: 'Galaxy S26 Ultra',
    subtitle: 'Just ₹7,778/M*',
    desc: 'Privacy display, for your eyes only',
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80',
    bg: '#F5F5F7',
  },
  {
    id: 2,
    brand: 'APPLE',
    title: 'iPhone 16 Pro',
    subtitle: 'From ₹1,19,900',
    desc: 'Built for Apple Intelligence',
    img: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80',
    bg: '#E8F0FF',
  },
  {
    id: 3,
    brand: 'ONEPLUS',
    title: 'OnePlus 13',
    subtitle: 'Just ₹2,499/M*',
    desc: 'Never Settle for Less',
    img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&q=80',
    bg: '#FFF0F0',
  },
  {
    id: 4,
    brand: 'SONY',
    title: 'WH-1000XM5',
    subtitle: 'From ₹24,990',
    desc: 'Industry-leading noise cancelling',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    bg: '#F0F5FF',
  },
  {
    id: 5,
    brand: 'BOAT',
    title: 'Airdopes 141',
    subtitle: 'From ₹999',
    desc: 'Up to 42H Playtime | Beast Mode',
    img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
    bg: '#FFF8E1',
  },
];

const AD_CARDS = [
  {
    label: 'GARNIER',
    tagline: 'Up to 25% Off',
    sub: 'Fresh & plump',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80',
    bg: '#FFF3E0',
  },
  {
    label: 'CLOSEUP',
    tagline: 'Shop now',
    sub: 'Lasting freshness',
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80',
    bg: '#E8F5E9',
  },
  {
    label: 'FASHION',
    tagline: 'Min. 55% Off',
    sub: 'Casual shirts',
    img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=80',
    bg: '#F3E5F5',
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  const [slide, setSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const suggestedRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 20 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-slide center banner
  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % BANNER_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      const d = end - now;
      setTimeLeft({
        h: String(Math.floor(d / 3600000)).padStart(2, '0'),
        m: String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((d % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleAddToCart = (id) => {
    dispatch(addItemToCart({ productId: id, quantity: 1 }));
    toast.success('Added to cart');
  };

  const scrollSuggested = (dir) =>
    suggestedRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });

  if (error) {
    return (
      <div className="max-w-[1360px] mx-auto pt-6 px-4">
        <ErrorState onRetry={() => dispatch(fetchProducts({ limit: 20 }))} />
      </div>
    );
  }

  const cur = BANNER_SLIDES[slide];

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      <div className="max-w-[1360px] mx-auto px-2 pt-3 space-y-3">

        {/* ── HERO BANNER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] bg-white shadow-sm overflow-hidden" style={{ minHeight: 280 }}>

          {/* Left static card */}
          <div className="hidden lg:flex bg-[#FCE4EC] flex-col justify-between p-6 border-r border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">Today's Pick</p>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Baby Diapers</h2>
              <p className="text-lg font-bold text-pink-600 mt-1">Min.50% Off</p>
              <p className="text-xs text-gray-500 mt-2">Cuddles, Little Angel & More</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=240&q=80"
              alt=""
              className="w-28 h-28 object-contain mx-auto"
            />
          </div>

          {/* Center auto-slider */}
          <div
            className="relative overflow-hidden flex items-center"
            style={{ background: cur.bg, transition: 'background 0.6s ease' }}
          >
            <div className="flex w-full h-full items-center px-10 py-6 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm tracking-[0.2em] mb-2 opacity-50 uppercase">{cur.brand}</p>
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">{cur.title}</h2>
                <p className="text-xl font-bold text-gray-700 mt-1">{cur.subtitle}</p>
                <p className="text-sm text-gray-500 mt-2">{cur.desc}</p>
              </div>
              <img
                key={cur.id}
                src={cur.img}
                alt={cur.title}
                className="w-44 h-44 object-contain flex-shrink-0 banner-img"
              />
            </div>

            {/* Arrows */}
            <button
              onClick={() => setSlide((p) => (p - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10 transition"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setSlide((p) => (p + 1) % BANNER_SLIDES.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10 transition"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide ? 'w-5 h-1.5 bg-gray-700' : 'w-1.5 h-1.5 bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right static card */}
          <div className="hidden lg:flex bg-[#EEF2FF] flex-col justify-between p-6 border-l border-gray-100">
            <div>
              <p className="font-black text-sm tracking-[0.2em] opacity-50 mb-1 uppercase">Samsung</p>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Galaxy Book4</h2>
              <p className="text-lg font-bold text-gray-700 mt-1">From ₹44,990*</p>
              <p className="text-xs text-gray-500 mt-2">Multiple ports | Galaxy ecosystem</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=240&q=80"
              alt=""
              className="w-28 h-28 object-contain mx-auto"
            />
          </div>
        </div>

        {/* ── AD CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white shadow-sm overflow-hidden">
          {AD_CARDS.map((ad, i) => (
            <div
              key={i}
              className={`flex flex-row items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                i < 2 ? 'border-b md:border-b-0 md:border-r border-gray-100' : ''
              }`}
            >
              <div
                className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: ad.bg }}
              >
                <img src={ad.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ad.label}</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{ad.tagline}</p>
                <p className="text-sm text-gray-500">{ad.sub}</p>
              </div>
              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold self-start flex-shrink-0">
                AD
              </span>
            </div>
          ))}
        </div>

        {/* ── SUGGESTED FOR YOU ── */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Suggested For You</h2>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                <Clock className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="font-medium">{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s left</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollSuggested(-1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => scrollSuggested(1)}
                className="w-8 h-8 rounded-full bg-[#2874F0] flex items-center justify-center hover:bg-blue-700 transition"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div ref={suggestedRef} className="flex px-4 py-4 gap-1 overflow-x-auto scrollbar-hide">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0"><SkeletonCard /></div>
                ))
              : products?.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex-shrink-0">
                    <ProductCard product={p} onAddToCart={handleAddToCart} />
                  </div>
                ))}
          </div>
        </div>

        {/* ── BEST SELLERS ── */}
        <div className="bg-white shadow-sm mb-6">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Best Sellers in Electronics</h2>
            <button className="text-sm font-semibold text-[#2874F0] hover:underline">VIEW ALL</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-4 bg-gray-50/30">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-center w-full"><SkeletonCard /></div>
                ))
              : products?.slice(10, 20).map((p) => (
                  <div key={p.id} className="flex justify-center w-full">
                    <ProductCard product={p} onAddToCart={handleAddToCart} />
                  </div>
                ))}
          </div>
        </div>

      </div>

      <style>{`
        .banner-img { animation: bannerIn 0.4s ease; }
        @keyframes bannerIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
