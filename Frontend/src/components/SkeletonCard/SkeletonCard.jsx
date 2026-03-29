import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="w-[220px] bg-white border border-flipborder shadow-sm rounded-sm flex flex-col p-2">
      {/* Image Block */}
      <div className="h-48 w-full bg-gray-200 animate-pulse rounded-sm"></div>
      
      {/* Content Blocks */}
      <div className="flex flex-col pt-3 px-1 pb-1">
        {/* Name */}
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-sm"></div>
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-sm mt-2"></div>
        
        {/* Rating */}
        <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded-sm mt-2"></div>
        
        {/* Price */}
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-sm mt-2 mb-1"></div>
      </div>
    </div>
  );
}
