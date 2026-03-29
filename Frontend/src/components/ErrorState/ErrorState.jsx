import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ onRetry }) {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-white shadow-sm rounded-sm">
      <AlertTriangle className="w-[60px] h-[60px] text-fliporange mb-4 opacity-80" strokeWidth={1.5} />
      <h2 className="text-[18px] font-bold text-flipprimary text-center">
        Something went wrong.
      </h2>
      <p className="text-flipsecondary text-[14px] mt-2 mb-6 text-center">
        Please try again.
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-flipblue text-white px-10 py-2.5 font-bold uppercase shadow-sm hover:shadow-md transition-shadow text-[14px] rounded-sm tracking-wide focus:outline-none"
        >
          Retry
        </button>
      )}
    </div>
  );
}
