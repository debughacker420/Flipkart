import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Smartphone,
  Monitor,
  Shirt,
  Home as HomeIcon,
  BookOpen,
  Dumbbell,
  LayoutGrid,
  ChevronDown,
  Gift,
  Gamepad2,
  Car,
  Armchair,
  Sparkles,
} from 'lucide-react';
import { fetchCategories } from '../../redux/productSlice';

const ICON_MAP = {
  'mobiles': Smartphone,
  'electronics': Monitor,
  'fashion': Shirt,
  'home-kitchen': HomeIcon,
  'books': BookOpen,
  'sports-fitness': Dumbbell,
  'beauty': Sparkles,
  'toys': Gamepad2,
  'auto': Car,
  'furniture': Armchair,
  'gift': Gift,
  'default': LayoutGrid,
};

export default function CategoryStrip() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const handleCategoryClick = (slug) => {
    if (slug) navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  if (loading && (!categories || categories.length === 0)) {
    return (
      <div className="w-full bg-white border-t border-gray-100">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto py-2 scrollbar-hide">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-12 h-2.5 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-t border-gray-100">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-4">
        <div className="flex items-start justify-start sm:justify-between overflow-x-auto py-2 scrollbar-hide gap-3 sm:gap-4">

          {/* For You */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 shrink-0 group min-w-[52px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-[#2874F0]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#2874F0] border-b-2 border-[#2874F0] pb-px whitespace-nowrap">
              For You
            </span>
          </button>

          {categories?.map((cat, idx) => {
            const slug = typeof cat === 'string' ? cat : (cat.slug || cat.id);
            const label = typeof cat === 'string' ? cat : (cat.name || cat.title || cat.slug || '');
            const displayLabel = typeof label === 'string'
              ? label.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).split(' ')[0]
              : label;
            const Icon = ICON_MAP[slug] || ICON_MAP['default'];

            return (
              <button
                key={slug || idx}
                onClick={() => handleCategoryClick(slug)}
                className="flex flex-col items-center gap-1 shrink-0 group min-w-[52px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-[#2874F0] transition" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 group-hover:text-[#2874F0] transition whitespace-nowrap">
                  {displayLabel}
                </span>
              </button>
            );
          })}

          {/* More */}
          <button className="flex flex-col items-center gap-1 shrink-0 group min-w-[52px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-[#2874F0] transition" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 group-hover:text-[#2874F0] transition flex items-center gap-0.5 whitespace-nowrap">
              More <ChevronDown className="w-3 h-3" />
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
