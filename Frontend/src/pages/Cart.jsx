import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateItem, removeItem } from '../redux/cartSlice';
import { ShoppingCart } from 'lucide-react';
import CartItem from '../components/CartItem/CartItem';
import PriceSummary from '../components/PriceSummary/PriceSummary';
import ErrorState from '../components/ErrorState/ErrorState';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
    window.scrollTo(0, 0); // Stabilize UI bounds upon initial navigation
  }, [dispatch]);

  const handleQuantityChange = (id, newQty) => {
    dispatch(updateItem({ itemId: id, quantity: newQty }));
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };

  if (loading && (!items || items.length === 0)) {
     return (
       <div className="w-full min-h-[500px] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-flipblue border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-6 pb-20 px-4">
        <ErrorState onRetry={() => dispatch(fetchCart())} />
      </div>
    );
  }

  // EMPTY CART STATE FALLBACK
  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-4 pb-12 px-2 md:px-4">
        <div className="bg-white m-0 sm:m-4 flex flex-col items-center justify-center py-[70px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm min-h-[400px]">
          
          <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png" className="w-[180px] md:w-[220px] object-contain mb-2" alt="Empty Cart" />
          
          <h2 className="text-[18px] font-medium text-flipprimary mt-6 tracking-wide">Your cart is empty!</h2>
          <p className="text-flipsecondary text-sm mt-2 font-medium">Add items to it now.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-flipblue text-white px-16 py-3 mt-8 font-medium shadow-sm rounded-[2px] hover:shadow-md transition-shadow text-[15px]"
          >
            Shop now
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE CART DATA VISUALIZATION ARRAY
  return (
    <div className="w-full max-w-7xl mx-auto pt-4 pb-12 px-2 md:px-4 flex flex-col lg:flex-row gap-4 items-start relative">
      
      {/* LEFT COMPARTMENT: Dynamically Loaded Cart Components List */}
      <div className="flex-1 w-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm flex flex-col overflow-hidden border border-transparent">
        
        {/* Universal Delivery Header Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-flipborder gap-3 sm:gap-0">
          <h2 className="text-[18px] font-bold text-flipprimary flex items-center gap-2">
            My Cart <span className="font-medium text-[14px] text-flipsecondary opacity-80">({items.length} items)</span>
          </h2>
          <div className="flex items-center text-[14px]">
             <span className="text-flipsecondary mr-2">Deliver to:</span>
             <span className="font-bold text-flipprimary truncate max-w-[120px] sm:max-w-[200px]">New Delhi - 110001</span>
             <button className="text-flipblue ml-4 focus:outline-none bg-white font-medium border border-flipborder px-3 py-[5px] rounded-[3px] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow">
               Change
             </button>
          </div>
        </div>

        {/* Iteration Sequence Mapping Components Matrix */}
        <div className="flex flex-col">
          {items.map((item) => (
             <CartItem 
               key={item.id} 
               item={item} 
               onQuantityChange={handleQuantityChange} 
               onRemove={handleRemove} 
             />
          ))}
        </div>

        {/* Global Action Checkout Sticky Footer Mapping */}
        <div className="sticky bottom-0 bg-white border-t border-flipborder p-4 flex justify-end shadow-[0_-2px_6px_rgba(0,0,0,0.05)] z-20">
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-fliporange text-white font-bold py-3.5 px-12 text-[15px] uppercase rounded-sm hover:bg-[#fb5300] transition-colors shadow-sm tracking-wide w-full sm:w-auto"
          >
            Place Order
          </button>
        </div>
      </div>

      {/* RIGHT COMPARTMENT: Contextual Billing Summary Sticky Widget */}
      <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 sticky top-[64px] self-start z-10 hidden lg:block">
         <PriceSummary items={items} showPlaceOrder={false} />
         
         <div className="mt-4 flex items-center gap-3 text-flipsecondary text-[13px] font-medium leading-snug tracking-wider">
           <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg" className="w-[30px] h-[34px] grayscale opacity-70" alt="Safe Payment Shield" />
           <p className="flex-1">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
         </div>
      </div>

      {/* Mobile Breakpoint Fallback Block */}
      <div className="w-full lg:hidden flex flex-col gap-4">
         <PriceSummary items={items} showPlaceOrder={false} />
         
         <div className="flex items-center gap-3 text-flipsecondary text-[13px] font-medium px-4 pb-4">
           <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg" className="w-6 h-auto grayscale opacity-70" alt="Shield Logo" />
           <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
         </div>
      </div>
      
    </div>
  );
}
