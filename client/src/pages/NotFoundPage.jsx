import React from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-500 mb-8 shadow-2xl shadow-emerald-500/20">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-black text-white tracking-tight mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-300 mb-6">Cargo Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
        The route you are looking for has been bypassed or the freight has already been delivered. Let's get you back on the main corridor.
      </p>
      <button 
        onClick={() => {
          if (window.history.length > 1) {
            window.history.replaceState({}, '', '/');
          }
          onNavigate('landing');
        }}
        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dispatch
      </button>
    </div>
  );
}
