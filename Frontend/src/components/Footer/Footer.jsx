import React from 'react';
import { Facebook, Twitter, Youtube, CreditCard, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#172337] w-full mt-auto">
      <div className="max-w-7xl mx-auto pt-10 pb-6 pr-4 pl-4 md:pl-10">
        
        {/* Main Columns Container */}
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-8 pb-10 border-b border-gray-600/50">
          
          {/* Column 1: ABOUT */}
          <div className="flex flex-col gap-[10px] min-w-[150px]">
            <h3 className="text-[#878787] text-[13px] font-bold mb-1">ABOUT</h3>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">About Us</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Careers</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Press</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Flipkart Stories</a>
          </div>

          {/* Column 2: HELP */}
          <div className="flex flex-col gap-[10px] min-w-[150px]">
            <h3 className="text-[#878787] text-[13px] font-bold mb-1">HELP</h3>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Payments</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Shipping</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Returns</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">FAQ</a>
          </div>

          {/* Column 3: CONSUMER POLICY */}
          <div className="flex flex-col gap-[10px] min-w-[150px]">
            <h3 className="text-[#878787] text-[13px] font-bold mb-1">CONSUMER POLICY</h3>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Terms</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Privacy</a>
            <a href="#" className="text-white text-[13px] hover:underline decoration-white/70">Sitemap</a>
          </div>

          {/* Divider purely on Desktop */}
          <div className="hidden md:block w-[1px] bg-gray-600/50 mr-2"></div>

          {/* Column 4: SOCIAL */}
          <div className="flex flex-col gap-[10px] min-w-[150px]">
            <h3 className="text-[#878787] text-[13px] font-bold mb-1">SOCIAL</h3>
            <a href="#" className="flex items-center text-white text-[13px] hover:underline decoration-white/70 gap-3">
               <Facebook className="w-[15px] h-[15px]" fill="currentColor" /> Facebook
            </a>
            <a href="#" className="flex items-center text-white text-[13px] hover:underline decoration-white/70 gap-3">
               <Twitter className="w-[15px] h-[15px]" fill="currentColor" /> Twitter
            </a>
            <a href="#" className="flex items-center text-white text-[13px] hover:underline decoration-white/70 gap-3">
               <Youtube className="w-[15px] h-[15px]" /> YouTube
            </a>
          </div>

        </div>

        {/* Bottom Bar Container */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2 text-white text-[13px] font-medium tracking-wide">
            <ShieldCheck className="w-[18px] h-[18px] text-flipyellow" />
            <span>100% Secure Payments</span>
          </div>

          <div className="text-white text-[13px] mt-1 md:mt-0 opacity-90">
            © {new Date().getFullYear()} Flipkart Clone. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
             <CreditCard className="w-7 h-7 text-white opacity-80" />
             <div className="font-bold italic text-white text-[14px] opacity-80 tracking-wider">VISA</div>
             <div className="font-bold italic text-white text-[14px] opacity-80 tracking-wider">UPI</div>
          </div>
          
        </div>

      </div>
    </footer>
  );
}
