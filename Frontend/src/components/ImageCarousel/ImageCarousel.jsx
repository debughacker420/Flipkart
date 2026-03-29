import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageCarousel({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback for empty image arrays
  if (!images || images.length === 0) {
    return (
      <div className="w-[400px] flex-shrink-0">
        <div className="w-[400px] h-[400px] border border-flipborder flex items-center justify-center bg-white text-flipsecondary text-sm">
          No Image Available
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-[400px] flex-shrink-0 flex flex-col">
      {/* Main Image */}
      <div className="relative w-[400px] h-[400px] border border-flipborder bg-white group overflow-hidden flex items-center justify-center">
        <img 
          src={images[selectedIndex]} 
          alt={`Product View ${selectedIndex + 1}`} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-flipprimary hover:text-flipblue transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-[20px] h-[20px] mr-[2px]" />
            </button>
            
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-flipprimary hover:text-flipblue transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-[20px] h-[20px] ml-[2px]" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-3 w-full">
          {images.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-14 h-14 flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-colors bg-white ${
                selectedIndex === idx 
                  ? 'border-flipblue border-opacity-100' 
                  : 'border-flipborder hover:border-flipblue/50'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-contain p-1"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
