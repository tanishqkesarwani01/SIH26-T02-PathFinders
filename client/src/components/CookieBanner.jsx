import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900 border-t border-slate-700 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideUp">
      <div className="text-sm text-slate-300">
        <strong className="text-white">We use cookies.</strong> We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setIsVisible(false)} 
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Decline
        </button>
        <button 
          onClick={acceptCookies} 
          className="px-5 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
