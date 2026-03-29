import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAddresses, addAddress, placeOrder } from '../services/api';
import { fetchCart } from '../redux/cartSlice';
import { openLoginModal } from '../redux/authSlice';
import PriceSummary from '../components/PriceSummary/PriceSummary';
import CartItem from '../components/CartItem/CartItem';
import { ArrowRight, Check, LockKeyhole, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(2);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', pincode: '', city: '', state: '', addressLine1: '', addressLine2: '', type: 'HOME'
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (!items || items.length === 0) {
       navigate('/cart');
       return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    const fetchAddr = async () => {
      try {
        const data = await getAddresses();
        const loadedAddresses = data || [];
        setAddresses(loadedAddresses);
        if (loadedAddresses.length > 0) {
          // Select default address or first
          const defaultAddr = loadedAddresses.find(a => a.is_default) || loadedAddresses[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddr();
    window.scrollTo(0, 0);
  }, [isAuthenticated, items, navigate]);

  const handleDeliverHere = (id) => {
    setSelectedAddressId(id);
    setStep(3);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const savedAddr = await addAddress(newAddress);
      setAddresses([...addresses, savedAddr]);
      setSelectedAddressId(savedAddr.id);
      setShowNewAddressForm(false);
      setNewAddress({ fullName: '', phone: '', pincode: '', city: '', state: '', addressLine1: '', addressLine2: '', type: 'HOME' });
      toast.success('Address saved successfully!');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select an address');
      return;
    }
    try {
      setPlacing(true);
      const payMethod = paymentMethod === 'Cash on Delivery' ? 'COD' : paymentMethod;
      const orderData = await placeOrder(selectedAddressId, payMethod);
      // Refresh cart (should be empty now)
      dispatch(fetchCart());
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${orderData?.id || 'unknown'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false); 
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-flipbg px-4 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[28px] bg-white p-8 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-flipblue">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Checkout</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Login to continue your purchase</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Addresses and order placement are now account-bound. Sign in to continue with delivery details and payment.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => dispatch(openLoginModal('login'))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-flipblue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open Login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-flipbg min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto pt-6 px-2 sm:px-4 pb-16 flex flex-col lg:flex-row gap-4">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-[15px]">
          
          {/* STEP 1: STATIC LOGIN COMPLETED */}
          <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-start px-4 sm:px-6 py-4 bg-white">
               <div className="flex gap-4">
                  <div className="w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] bg-[#f0f0f0] text-flipblue font-medium rounded-sm flex items-center justify-center text-[12px] sm:text-sm mt-0.5">
                    1
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] sm:text-[16px] font-medium text-flipsecondary uppercase tracking-wide">
                      Login <span className="text-flipblue ml-2">✓</span>
                    </span>
                    <span className="text-[13px] sm:text-[14px] font-bold text-flipprimary mt-1 sm:mt-1.5 flex flex-col sm:flex-row sm:items-center">
                      {user?.name || 'Flipkart User'}{user?.phone && <span className="text-flipsecondary font-medium mt-1 sm:mt-0 sm:ml-4">{user.phone}</span>}
                    </span>
                  </div>
               </div>
               <button
                 type="button"
                 onClick={() => dispatch(openLoginModal('login'))}
                 className="text-flipblue font-medium text-[13px] sm:text-[14px] uppercase border border-flipborder px-4 sm:px-5 py-1.5 sm:py-2 rounded-sm bg-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow"
               >
                 Change
               </button>
            </div>
          </div>

          {/* STEP 2: DELIVERY ADDRESS */}
          <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden flex flex-col border border-transparent transition-all">
            
            <div className={`flex items-center gap-4 px-4 sm:px-6 py-4 cursor-default ${step === 2 ? 'bg-flipblue text-white shadow-sm' : 'bg-white text-flipsecondary border-b border-flipborder cursor-pointer hover:bg-gray-50 transition-colors'}`} onClick={() => { if(step > 2) setStep(2); }}>
               <div className={`w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] ${step === 2 ? 'bg-white text-flipblue' : 'bg-[#f0f0f0] text-flipblue'} font-medium rounded-sm flex items-center justify-center text-[12px] sm:text-sm`}>
                 2
               </div>
               <span className={`text-[14px] sm:text-[16px] font-bold uppercase tracking-wide ${step === 2 ? 'text-white' : 'text-flipsecondary'}`}>
                 Delivery Address {step > 2 && <span className="text-flipblue ml-2">✓</span>}
               </span>
               {step > 2 && <button onClick={(e) => { e.stopPropagation(); setStep(2); }} className="ml-auto text-flipblue font-medium text-[13px] sm:text-[14px] uppercase border border-flipborder px-4 sm:px-5 py-1.5 sm:py-2 rounded-sm bg-white hover:shadow-sm">Change</button>}
            </div>

            {step === 2 && (
              <div className="flex flex-col bg-white">
                <div className="text-[12px] sm:text-[13px] font-bold text-flipsecondary px-4 sm:px-6 pt-5 pb-2.5 tracking-wider uppercase">Select Delivery Address</div>
                
                {addresses.map((addr) => (
                  <div key={addr.id} className={`relative flex flex-col px-4 sm:px-6 py-4 sm:py-5 border-b border-flipborder cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'bg-[#f5faff]' : 'hover:bg-gray-50'}`} onClick={() => setSelectedAddressId(addr.id)}>
                    <div className="flex items-start gap-4">
                       <input type="radio" name="address" checked={selectedAddressId === addr.id} readOnly className="mt-1 w-4 h-4 text-flipblue bg-white border-gray-300 focus:ring-1 focus:ring-flipblue cursor-pointer" />
                       <div className="flex flex-col flex-1 sm:pl-1 mt-[1px]">
                          <div className="flex items-center gap-4">
                             <span className="font-bold text-[14px] sm:text-[15px] text-flipprimary tracking-wide">{addr.name}</span>
                             <span className="bg-[#f0f0f0] text-flipsecondary font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm uppercase tracking-wide">{addr.type || 'HOME'}</span>
                             <span className="font-bold text-[14px] sm:text-[15px] text-flipprimary ml-[2px]">{addr.mobile}</span>
                          </div>
                          <span className="text-[14px] text-flipprimary mt-2.5 leading-relaxed tracking-wide opacity-90 max-w-xl">
                            {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                          </span>
                          
                          {selectedAddressId === addr.id && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeliverHere(addr.id); }}
                              className="mt-5 bg-fliporange text-white text-[14px] sm:text-[15px] font-bold px-10 py-3.5 w-full sm:w-auto rounded-sm shadow-sm hover:bg-[#fb5300] uppercase tracking-wide transition-colors"
                            >
                              Deliver Here
                            </button>
                          )}
                       </div>
                    </div>
                  </div>
                ))}

                {/* New address form */}
                <div className="px-4 sm:px-6 py-4 border-t border-flipborder bg-white mt-2">
                  {!showNewAddressForm ? (
                    <div 
                      className="flex items-center gap-3 text-flipblue font-bold text-[14px] cursor-pointer hover:bg-blue-50 w-full sm:w-fit px-3 py-2 -ml-2 rounded-sm transition-colors uppercase tracking-wide"
                      onClick={() => setShowNewAddressForm(true)}
                    >
                      <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} /> Add a new address
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="flex flex-col bg-[#f5faff] border border-[#e0e0e0] p-4 sm:p-6 rounded-sm mb-4">
                      
                      <div className="flex items-center gap-3 text-flipblue font-medium text-[14px] mb-6 uppercase tracking-wide">
                        <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} /> Add a new address
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" required value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] rounded-sm bg-white transition-colors" />
                        <input type="tel" placeholder="10-digit mobile number" required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] rounded-sm bg-white transition-colors" />
                        <input type="text" placeholder="Pincode" required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] rounded-sm bg-white transition-colors" />
                        <input type="text" placeholder="City" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] rounded-sm bg-white transition-colors" />
                        <input type="text" placeholder="State" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] rounded-sm bg-white transition-colors" />
                        <div /> {/* spacer */}
                        <textarea placeholder="Address (Area and Street)" required rows="3" value={newAddress.addressLine1} onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] sm:col-span-2 resize-none rounded-sm bg-white transition-colors" />
                        <textarea placeholder="Locality/Town (Optional)" rows="2" value={newAddress.addressLine2} onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})} className="border border-gray-300 p-3.5 outline-none focus:border-flipblue text-[14px] sm:col-span-2 resize-none rounded-sm bg-white transition-colors" />
                      </div>
                      
                      <div className="mt-6 flex flex-col gap-3">
                        <span className="text-[13px] text-flipsecondary font-bold tracking-wide">Address Type</span>
                        <div className="flex gap-6 mt-1 flex-wrap">
                          {['HOME', 'WORK', 'OTHER'].map(type => (
                             <label key={type} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-flipprimary">
                               <input type="radio" name="addrType" checked={newAddress.type === type} onChange={() => setNewAddress({...newAddress, type})} className="w-4 h-4 text-flipblue border-gray-300 focus:ring-1 focus:ring-flipblue cursor-pointer" />
                               {type}
                             </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button type="submit" className="bg-fliporange text-white font-bold py-3.5 px-10 text-[14px] uppercase rounded-[2px] shadow-sm hover:bg-[#fb5300] transition-colors tracking-wide w-full sm:w-auto">
                          Save and Deliver Here
                        </button>
                        <button type="button" onClick={() => setShowNewAddressForm(false)} className="text-flipblue font-medium py-3 px-8 text-[14px] uppercase tracking-wide hover:underline hover:bg-blue-50 transition-colors w-full sm:w-auto mt-2 sm:mt-0">
                          Cancel
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: ORDER SUMMARY */}
          <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden flex flex-col transition-all">
            <div className={`flex items-center gap-4 px-4 sm:px-6 py-4 cursor-default ${step === 3 ? 'bg-flipblue text-white shadow-sm' : 'bg-white text-flipsecondary border-b border-flipborder hover:bg-gray-50 transition-colors cursor-pointer'}`} onClick={() => { if(step > 3) setStep(3); }}>
               <div className={`w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] ${step === 3 ? 'bg-white text-flipblue' : 'bg-[#f0f0f0] text-flipblue'} font-medium rounded-sm flex items-center justify-center text-[12px] sm:text-sm`}>
                 3
               </div>
               <span className={`text-[14px] sm:text-[16px] font-bold uppercase tracking-wide ${step === 3 ? 'text-white' : 'text-flipsecondary'}`}>
                 Order Summary {step > 3 && <span className="text-flipblue ml-2">✓</span>}
               </span>
               {step > 3 && <button onClick={(e) => { e.stopPropagation(); setStep(3); }} className="ml-auto text-flipblue font-medium text-[13px] sm:text-[14px] uppercase border border-flipborder px-4 sm:px-5 py-1.5 sm:py-2 rounded-sm bg-white hover:shadow-sm">Change</button>}
            </div>
            
            {step === 3 && (
              <div className="flex flex-col">
                 <div className="max-h-[350px] overflow-y-auto">
                    {items.map(item => (
                       <CartItem key={item.id} item={item} onQuantityChange={() => {}} />
                    ))}
                 </div>
                 
                 <div className="p-4 sm:p-5 border-t border-flipborder flex flex-col md:flex-row justify-between items-center bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.02)] gap-4 md:gap-0 sticky bottom-0">
                    <span className="text-[14px] font-medium text-flipprimary tracking-wide hidden md:block">Order confirmation email will be sent to <span className="font-bold">{user?.email}</span></span>
                    <button onClick={() => setStep(4)} className="bg-fliporange text-white font-bold py-3.5 px-12 text-[15px] uppercase rounded-[2px] shadow-sm hover:bg-[#fb5300] transition-colors tracking-wide w-full md:w-auto">
                      Continue
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* STEP 4: PAYMENT */}
          <div className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden flex flex-col mb-12 border border-transparent transition-all">
            <div className={`flex items-center gap-4 px-4 sm:px-6 py-4 ${step === 4 ? 'bg-flipblue text-white shadow-sm' : 'bg-white text-flipsecondary border-b border-flipborder'}`}>
               <div className={`w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] ${step === 4 ? 'bg-white text-flipblue' : 'bg-[#f0f0f0] text-flipblue'} font-medium rounded-sm flex items-center justify-center text-[12px] sm:text-sm`}>
                 4
               </div>
               <span className={`text-[14px] sm:text-[16px] font-bold uppercase tracking-wide ${step === 4 ? 'text-white' : 'text-flipsecondary'}`}>
                 Payment Options
               </span>
            </div>

            {step === 4 && (
              <div className="flex flex-col bg-white">
                <div className="text-[13px] font-bold text-flipsecondary px-4 sm:px-6 pt-5 pb-2.5 tracking-wider uppercase">Select Payment Method</div>
                
                <div className="flex flex-col border-t border-flipborder mt-2">
                   {['UPI', 'Credit / Debit / ATM Card', 'Net Banking', 'Cash on Delivery'].map(opt => (
                     <div key={opt} className={`flex flex-col border-b border-gray-200 last:border-0 ${paymentMethod === opt ? 'bg-[#f5faff]' : 'bg-white hover:bg-gray-50'}`}>
                        <label className="flex items-center gap-4 px-4 sm:px-6 py-5 cursor-pointer">
                           <input type="radio" name="payment" checked={paymentMethod === opt} onChange={() => setPaymentMethod(opt)} className="w-4 h-4 text-flipblue border-gray-300 focus:ring-1 focus:ring-flipblue cursor-pointer" />
                           <span className={`text-[15px] tracking-wide ${paymentMethod === opt ? 'font-bold text-flipprimary' : 'font-medium text-flipprimary'}`}>{opt}</span>
                        </label>
                        {paymentMethod === opt && (
                          <div className="pl-[50px] sm:pl-[56px] pr-4 sm:pr-6 pb-6 pt-2">
                             <button 
                               onClick={handleConfirmOrder}
                               disabled={placing}
                               className="bg-fliporange text-white text-[15px] font-bold px-12 py-3.5 rounded-[2px] shadow-sm hover:bg-[#fb5300] uppercase tracking-wide w-full sm:w-auto transition-colors disabled:opacity-50"
                             >
                               {placing ? 'Placing...' : 'Confirm Order'}
                             </button>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Price Summary */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 sticky top-[64px] self-start hidden lg:block z-10">
           <div className="border border-flipborder rounded-sm overflow-hidden bg-white shadow-sm">
             <PriceSummary items={items} showPlaceOrder={false} />
           </div>
           
           <div className="mt-4 flex items-start gap-4 text-flipsecondary text-[13px] font-medium leading-relaxed tracking-wider px-2">
             <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg" className="w-[30px] h-[34px] grayscale opacity-70 mt-1" alt="Safe Payment Shield" />
             <p className="flex-1">Safe and Secure Payments.<br/>Easy returns. <br/>100% Authentic products.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
