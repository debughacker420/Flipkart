import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../redux/productSlice';
import { addItemToCart } from '../redux/cartSlice';
import { getProductBrands } from '../services/api';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import ProductCard from '../components/ProductCard/ProductCard';
import SkeletonCard from '../components/SkeletonCard/SkeletonCard';
import ErrorState from '../components/ErrorState/ErrorState';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price -- Low to High', value: 'price_asc' },
  { label: 'Price -- High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const { products, categories, loading, totalCount, error } = useSelector((state) => state.products);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Parse URL Parameters
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page')) || 1;
  const brands = searchParams.getAll('brands') || [];
  const rating = searchParams.get('rating') || '';

  // Ensure Filter Sidebar Categories Data Availability
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  // Prevent infinite loops by using a primitive string for the dependency array
  const brandsString = brands.join(',');

  // Fetch available brands for current filter context
  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    getProductBrands(params).then(setAvailableBrands).catch(() => setAvailableBrands([]));
  }, [category, search]);

  // Main Product Fetch Sync Hook
  useEffect(() => {
    const params = {
      limit: 12,
      page: page,
    };
    if (category) params.category = category;
    if (search) params.search = search;
    if (priceMin) params.minPrice = priceMin;
    if (priceMax) params.maxPrice = priceMax;
    if (sort && sort !== 'relevance') params.sort = sort;

    if (brands && brands.length > 0) params.brands = brands;
    if (rating) params.rating = rating;

    dispatch(fetchProducts(params));
    window.scrollTo(0, 0);
  }, [category, search, priceMin, priceMax, sort, page, brandsString, rating, dispatch]);

  // Handlers
  const handleFilterChange = (newFilters) => {
    const newParams = new URLSearchParams();
    
    if (search) newParams.set('search', search);

    if (newFilters.category && newFilters.category.length > 0) {
      newParams.set('category', newFilters.category[newFilters.category.length - 1]);
    }
    
    if (newFilters.priceMin) newParams.set('priceMin', newFilters.priceMin);
    if (newFilters.priceMax) newParams.set('priceMax', newFilters.priceMax);
    if (newFilters.rating) newParams.set('rating', newFilters.rating);
    
    if (newFilters.brands && newFilters.brands.length > 0) {
      newFilters.brands.forEach(b => newParams.append('brands', b));
    }

    if (sort !== 'relevance') newParams.set('sort', sort);
    
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === 'relevance') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSort);
    }
    newParams.delete('page'); // Reset to page 1 on sort hook
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage);
    }
    setSearchParams(newParams);
  };

  const handleAddToCart = (id) => {
    dispatch(addItemToCart({ productId: id, quantity: 1 }));
    toast.success('Item added to cart! 🛒');
  };

  const currentFilters = {
    category: category ? [category] : [],
    priceMin,
    priceMax,
    brands,
    rating,
  };

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / ITEMS_PER_PAGE));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-6 pb-12 px-2 md:px-4">
        <ErrorState onRetry={() => {
          dispatch(fetchProducts({ limit: 12, skip: (page - 1) * 12 }));
        }} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-3 pb-8 px-2 md:px-4">
      
      {/* Breadcrumbs */}
      <div className="text-xs text-flipsecondary mb-3 flex items-center gap-1 font-medium tracking-wide">
        <Link to="/" className="hover:text-flipblue transition-colors">Home</Link>
        <span className="opacity-70">›</span>
        <span className="text-flipsecondary truncate">
          {category ? (category.charAt(0).toUpperCase() + category.slice(1)) : (search ? `Search Results for "${search}"` : 'Products')}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start relative">
        
        {/* LEFT: Filter Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar
            filters={currentFilters}
            onFilterChange={handleFilterChange}
            categories={categories}
            availableBrands={availableBrands}
          />
        </div>

        {/* RIGHT: Main Content Wall */}
        <div className="flex-1 w-full min-w-0 flex flex-col">
          
          {/* Top Sort Header */}
          <div className="bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] mb-2 rounded-sm border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="text-[15px] font-semibold text-flipprimary">
               {search 
                 ? `Showing ${products?.length || 0} results for "${search}"` 
                 : `Showing ${products?.length || 0} results`}
             </div>
             
             <div className="flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
               <span className="text-sm font-bold text-flipprimary shrink-0">Sort By</span>
               {SORT_OPTIONS.map((opt) => {
                 const isActive = sort === opt.value;
                 return (
                   <button
                     key={opt.value}
                     onClick={() => handleSortChange(opt.value)}
                     className={`text-[14px] pb-1 cursor-pointer transition-colors shrink-0 outline-none ${
                       isActive 
                         ? 'text-flipblue border-b-2 border-flipblue font-bold' 
                         : 'text-flipprimary hover:text-flipblue font-medium'
                     }`}
                   >
                     {opt.label}
                   </button>
                 );
               })}
             </div>
          </div>

          {/* Product Grid Layout */}
          <div className="bg-white p-4 shadow-sm rounded-sm min-h-[500px]">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex justify-center shrink-0 w-full max-w-[220px] mx-auto">
                     <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="w-full h-[400px] flex flex-col items-center justify-center text-center">
                <img src="https://intakhab.me/images/no-product-found.png" alt="No products" className="w-[200px] h-auto object-contain mb-4 opacity-70" onError={(e) => e.target.style.display='none'} />
                <h2 className="text-[18px] font-bold text-flipprimary">Sorry, no products found!</h2>
                <p className="text-flipsecondary mt-2 text-sm">Please check the spelling or try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-2">
                {products?.map(product => (
                  <div key={product.id} className="flex justify-center shrink-0 w-full max-w-[220px] mx-auto">
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Sequence */}
          {!loading && totalPages > 1 && (
            <div className="bg-white mt-4 py-3 flex items-center justify-center gap-1 shadow-sm rounded-sm border-t border-flipborder">
              <button 
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 font-bold text-flipblue uppercase text-[15px] disabled:text-gray-300 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-2 mx-6">
                {pageNumbers.map(num => (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
                    className={`w-10 h-10 flex items-center justify-center text-[15px] transition-colors rounded-full ${
                      page === num 
                        ? 'text-flipblue font-bold border-b-2 border-flipblue bg-[#f1f3f6]'
                        : 'text-flipprimary hover:text-flipblue hover:bg-[#f1f3f6] font-medium'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                {totalPages > 5 && <span className="flex items-end px-1 text-gray-500 font-bold tracking-widest pb-2">...</span>}
              </div>

              <button 
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 font-bold text-flipblue uppercase text-[15px] disabled:text-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
