import React, { useState } from 'react';

export default function FilterSidebar({ filters = {}, onFilterChange, categories = [], availableBrands = [] }) {
  const [localMin, setLocalMin] = useState(filters.priceMin || '');
  const [localMax, setLocalMax] = useState(filters.priceMax || '');
  const [showAllBrands, setShowAllBrands] = useState(false);

  const uniqueBrands = availableBrands;

  const displayBrands = showAllBrands ? uniqueBrands : uniqueBrands.slice(0, 5);

  const handleClearAll = () => {
    onFilterChange({});
    setLocalMin('');
    setLocalMax('');
  };

  const handleCategoryChange = (categorySlug) => {
    const currentCats = filters.category || [];
    const newCats = currentCats.includes(categorySlug)
      ? currentCats.filter(c => c !== categorySlug)
      : [...currentCats, categorySlug];
    
    onFilterChange({ ...filters, category: newCats });
  };

  const handlePriceGo = () => {
    onFilterChange({ ...filters, priceMin: localMin, priceMax: localMax });
  };

  const handleBrandChange = (brand) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
      
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleRatingChange = (ratingStr) => {
    // Treat rating as a single toggle
    const newRating = filters.rating === ratingStr ? '' : ratingStr;
    onFilterChange({ ...filters, rating: newRating });
  };

  return (
    <aside className="w-[240px] bg-white shadow-sm flex-shrink-0 self-start sticky top-[64px] border border-flipborder/50">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-flipborder">
        <span className="text-sm font-bold text-flipprimary">FILTERS</span>
        <span 
          onClick={handleClearAll}
          className="text-flipblue text-[13px] font-medium cursor-pointer uppercase hover:underline"
        >
          Clear All
        </span>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-flipborder flex flex-col pt-3 pb-3">
        <h3 className="text-xs font-medium text-flipprimary tracking-wide uppercase mb-3">
          Category
        </h3>
        <div className="flex flex-col gap-[14px]">
          {categories.map((cat, idx) => {
            const slug = typeof cat === 'string' ? cat : (cat.slug || cat.id);
            const label = typeof cat === 'string' 
              ? cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
              : (cat.name || cat.title || cat.slug);
            const isChecked = (filters.category || []).includes(slug);
            
            return (
              <label key={slug || idx} className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => handleCategoryChange(slug)}
                  className="w-[15px] h-[15px] text-flipblue bg-white border-flipborder cursor-pointer accent-flipblue"
                />
                <span className="ml-[11px] text-[14px] text-flipprimary group-hover:text-flipblue transition-colors">
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="p-4 border-b border-flipborder flex flex-col pt-3 pb-4">
        <h3 className="text-xs font-medium text-flipprimary tracking-wide uppercase mb-3">
          Price Range
        </h3>
        <div className="flex items-center px-0.5">
          <input 
            type="number"
            placeholder="Min ₹"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-1/2 h-10 border border-flipborder rounded-sm text-sm px-2 text-flipprimary outline-none focus:border-flipblue"
          />
          <span className="text-flipsecondary text-sm mx-2">to</span>
          <input 
            type="number"
            placeholder="Max ₹"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-1/2 h-10 border border-flipborder rounded-sm text-sm px-2 text-flipprimary outline-none focus:border-flipblue"
          />
          <button 
            onClick={handlePriceGo}
            className="text-flipblue border border-flipblue px-3 py-[6px] text-sm ml-2 font-medium rounded-sm hover:bg-flipblue hover:text-white transition-colors h-[38px]"
          >
            GO
          </button>
        </div>
      </div>

      {/* Brands */}
      {uniqueBrands.length > 0 && (
        <div className="p-4 border-b border-flipborder flex flex-col pt-3 pb-3">
          <h3 className="text-xs font-medium text-flipprimary tracking-wide uppercase mb-3">
            Brands
          </h3>
          <div className="flex flex-col gap-[14px]">
            {displayBrands.map((brand, idx) => {
              const isChecked = (filters.brands || []).includes(brand);
              return (
                <label key={idx} className="flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleBrandChange(brand)}
                    className="w-[15px] h-[15px] text-flipblue bg-white border-flipborder cursor-pointer accent-flipblue"
                  />
                  <span className="ml-[11px] text-[14px] text-flipprimary group-hover:text-flipblue transition-colors truncate">
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
          {uniqueBrands.length > 5 && (
            <button 
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="mt-[14px] text-flipblue text-[13px] font-medium focus:outline-none hover:underline self-start uppercase px-0.5"
            >
              {showAllBrands ? 'Show Less' : `${uniqueBrands.length - 5} More`}
            </button>
          )}
        </div>
      )}

      {/* Customer Ratings */}
      <div className="p-4 border-b border-flipborder flex flex-col pt-3 pb-4">
        <h3 className="text-xs font-medium text-flipprimary tracking-wide uppercase mb-3">
          Customer Ratings
        </h3>
        <div className="flex flex-col gap-[14px]">
          {[4, 3].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.rating === String(rating)}
                onChange={() => handleRatingChange(String(rating))}
                className="w-[15px] h-[15px] text-flipblue bg-white border-flipborder cursor-pointer accent-flipblue"
              />
              <span className="ml-[11px] text-[14px] text-flipprimary group-hover:text-flipblue transition-colors">
                {rating}★ & above
              </span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
