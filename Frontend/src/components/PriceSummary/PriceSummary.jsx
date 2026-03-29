import React from 'react';
import { formatPrice } from '../../utils/formatPrice';

export default function PriceSummary({ items = [], showPlaceOrder = false, onPlaceOrder }) {
  if (!items || items.length === 0) return null;

  // Calculate totals
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  const totalMRP = items.reduce((acc, item) => {
    // Fallback to price if mrp is undefined
    const mrp = item.mrp || item.price;
    return acc + mrp * (item.quantity || 1);
  }, 0);

  const totalDiscountedPrice = items.reduce((acc, item) => {
    return acc + item.price * (item.quantity || 1);
  }, 0);

  const totalSavings = totalMRP - totalDiscountedPrice;

  return (
    <div className="bg-white shadow-sm flex flex-col rounded-sm border border-transparent">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-flipborder">
        <h2 className="text-sm font-bold text-flipsecondary tracking-wider uppercase">
          Price Details
        </h2>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Row calculations */}
        <div className="flex items-center justify-between text-[15px] text-flipprimary">
          <span>Price ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
          <span>{formatPrice(totalMRP)}</span>
        </div>

        <div className="flex items-center justify-between text-[15px] text-flipprimary">
          <span>Discount</span>
          <span className="text-flipgreen font-medium">- {formatPrice(totalSavings)}</span>
        </div>

        <div className="flex items-center justify-between text-[15px] text-flipprimary">
          <span>Delivery Charges</span>
          <span className="text-flipgreen font-medium">Free</span>
        </div>

        {/* Total Amount Divider */}
        <div className="border-t border-dashed border-flipborder pt-4 pb-1">
          <div className="flex items-center justify-between text-[16px] font-bold text-flipprimary">
            <span>Total Amount</span>
            <span>{formatPrice(totalDiscountedPrice)}</span>
          </div>
        </div>

        {/* Savings Text Banner Divider */}
        <div className="border-t border-dashed border-flipborder pt-3">
          <p className="text-flipgreen text-[15px] font-medium tracking-wide">
            You will save {formatPrice(totalSavings)} on this order
          </p>
        </div>
      </div>

      {/* CTA Section */}
      {showPlaceOrder && (
        <div className="px-4 pb-4 pt-1">
          <button 
            onClick={onPlaceOrder}
            className="w-full bg-fliporange text-white font-bold py-3.5 rounded-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer text-[15px] uppercase tracking-wide"
          >
            Place Order
          </button>
        </div>
      )}
      
    </div>
  );
}
