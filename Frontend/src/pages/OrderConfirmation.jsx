import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';
import { CheckCircle, Truck } from 'lucide-react';
import { formatDate, formatPrice } from '../utils/formatPrice';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // interceptor already unwraps response.data
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        // Fallback for display
        setOrder({
          id: orderId,
          items: [],
          address: { name: 'N/A', line1: '', line2: '', state: '', pincode: '', mobile: '' }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    window.scrollTo(0, 0);
  }, [orderId]);

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center bg-flipbg">
        <div className="w-10 h-10 border-4 border-flipblue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 5);
  const deliveryDateFormatted = formatDate(deliveryDateObj);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-flipbg pt-4 md:pt-[50px] pb-24 px-4">
      
      <div className="max-w-2xl mx-auto shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm bg-white flex flex-col border border-transparent">
        
        <div className="bg-flipblue h-[54px] w-full flex items-center justify-center rounded-t-[1px]">
          <h2 className="text-white font-bold text-[16px] tracking-wide uppercase">
            Your order has been placed!
          </h2>
        </div>

        <div className="px-4 md:px-12 py-10 md:py-12 text-center flex flex-col items-center">
          
          <CheckCircle className="w-[72px] h-[72px] text-[#388E3C] mx-auto opacity-90" strokeWidth={1.5} />
          
          <h1 className="text-[22px] md:text-[26px] font-bold text-flipprimary mt-5 tracking-tight">
            Order Placed Successfully!
          </h1>
          
          <div className="bg-[#f1f3f6] rounded-[2px] px-6 py-2.5 mt-5 inline-block border border-gray-200 shadow-sm">
            <span className="font-mono text-[14px] text-flipprimary font-bold tracking-wider leading-none">
              Order ID: #{(orderId || '').slice(0, 8)}
            </span>
          </div>

          {order?.totalAmount && (
            <div className="mt-4 text-[16px] font-bold text-flipprimary">
              Total: {formatPrice(order.totalAmount)}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3 text-[16px] font-medium text-flipprimary mt-7 tracking-wide">
            <Truck className="w-6 h-6 text-flipblue" />
            <span>Arriving by <span className="font-bold">{deliveryDateFormatted}</span></span>
          </div>

          {/* Purchased Items */}
          {order?.items && order.items.length > 0 && (
            <div className="flex gap-5 mt-8 justify-center flex-wrap pt-4 border-t border-gray-100 w-full md:w-3/4">
              {order.items.map((item) => (
                 <div key={item.id || item.productId} className="flex flex-col items-center w-[75px] group">
                    <div className="w-[60px] h-[60px] border border-flipborder rounded-[2px] p-1 bg-white shadow-sm flex items-center justify-center group-hover:border-flipblue transition-colors">
                       <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] text-flipsecondary group-hover:text-flipblue text-center mt-2 line-clamp-2 leading-tight font-medium transition-colors">
                       {item.title}
                    </span>
                 </div>
              ))}
            </div>
          )}

          {/* Shipping Address */}
          {order?.address && (
            <div className="bg-[#fbfffc] border border-[#e1f0e6] shadow-sm rounded-[2px] p-5 mt-10 text-[14px] text-left w-full sm:w-5/6 mx-auto transition-all hover:shadow">
              <h3 className="font-bold text-[14px] mb-3 text-flipsecondary uppercase tracking-wider border-b border-[#e1f0e6] pb-2">Delivery Address</h3>
              <div className="text-flipprimary leading-relaxed flex flex-col gap-1 mt-2">
                 <span className="font-bold text-[15px]">{order.address.name}</span>
                 <span className="text-flipsecondary">{order.address.line1 || order.address.address1}</span>
                 <span className="text-flipsecondary">{order.address.line2 || order.address.address2}</span>
                 <span className="text-flipsecondary">{order.address.city}{order.address.state ? `, ${order.address.state}` : ''} - <span className="font-bold">{order.address.pincode}</span></span>
                 <span className="font-bold mt-1.5 pt-1.5 border-t border-gray-100">Phone: {order.address.mobile}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-10 sm:mt-12 pt-4">
            <button 
              onClick={() => navigate('/')}
              className="border border-flipblue text-flipblue px-8 py-3.5 text-[14px] font-bold uppercase w-full sm:w-auto hover:bg-blue-50 transition-colors shadow-sm rounded-sm tracking-wide"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate('/account/orders')}
              className="bg-flipblue text-white px-8 py-3.5 text-[14px] font-bold uppercase w-full sm:w-auto hover:shadow-md transition-shadow shadow-sm rounded-sm tracking-wide"
            >
              View Order Details
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
