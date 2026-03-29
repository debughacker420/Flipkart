import React from 'react';
import { formatPrice, calculateDiscount } from '../../utils/formatPrice';

export default function CartItem({ item, onQuantityChange, onRemove }) {
  if (!item) return null;

  const { id, title, image, price, mrp, quantity = 1 } = item;
  
  const discount = calculateDiscount(price, mrp);
  const qty = quantity;

  const handleMinus = () => {
    if (qty > 1 && onQuantityChange) {
      onQuantityChange(id, qty - 1);
    }
  };

  const handlePlus = () => {
    if (onQuantityChange) {
      onQuantityChange(id, qty + 1);
    }
  };

  return (
    <div className="bg-white flex flex-row p-4 border-b border-flipborder hover:shadow-[0_0_4px_rgba(0,0,0,0.05)] transition-shadow">
      
      {/* LEFT: Image */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-[80px] h-[80px] border border-flipborder p-1 bg-white">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Quantity Stepper (Mobile positioning variant mapped to Desktop) */}
        {/* We place it in Middle as requested by spec, but typically it spans below image. */}
      </div>

      {/* MIDDLE: Details & Interactions */}
      <div className="flex-1 px-4 flex flex-col">
        <h3 className="text-sm font-medium line-clamp-2 text-flipprimary leading-relaxed hover:text-flipblue cursor-pointer">
          {title}
        </h3>
        
        <p className="text-xs text-flipsecondary mt-1">
          Seller: RetailNet
        </p>
        
        {/* Quantity Stepper */}
        <div className="flex items-center mt-4">
          <button 
            onClick={handleMinus}
            disabled={qty <= 1}
            className="w-[28px] h-[28px] rounded-full border border-flipborder flex items-center justify-center text-sm font-medium text-flipprimary hover:border-flipsecondary disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            -
          </button>
          
          <div className="h-[28px] border border-flipborder min-w-[46px] px-3 mx-2 flex items-center justify-center text-[14px] font-medium text-flipprimary bg-white">
             {qty}
          </div>
          
          <button 
            onClick={handlePlus}
            className="w-[28px] h-[28px] rounded-full border border-flipborder flex items-center justify-center text-sm font-medium text-flipprimary hover:border-flipsecondary bg-white"
          >
            +
          </button>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-6 mt-4 text-flipsecondary text-sm font-semibold uppercase tracking-wide">
          <span className="cursor-pointer hover:text-flipblue transition-colors">
            Save for later
          </span>
          <span 
            onClick={() => onRemove && onRemove(id)}
            className="cursor-pointer hover:text-flipblue transition-colors"
          >
            Remove
          </span>
        </div>
      </div>

      {/* RIGHT: Pricing Column */}
      <div className="w-auto min-w-[120px] flex flex-col items-start shrink-0 pl-4 border-l border-transparent">
        <span className="font-bold text-base text-flipprimary">
          {formatPrice(price * qty)}
        </span>
        
        {mrp > price && (
           <div className="flex items-center gap-2 mt-1">
             <span className="text-sm line-through text-flipsecondary">
               {formatPrice(mrp * qty)}
             </span>
             <span className="text-sm text-flipgreen font-medium">
               {discount}
             </span>
           </div>
        )}
      </div>
      
    </div>
  );
}
