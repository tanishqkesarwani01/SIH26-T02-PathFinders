import React from 'react';

export default function LegalModal({ isOpen, onClose, type }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms and Conditions';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative text-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 text-sm text-slate-300 space-y-4">
          <p>Last updated: October 2026</p>
          
          {isPrivacy ? (
            <>
              <h3 className="text-white font-semibold mt-4">1. Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
              
              <h3 className="text-white font-semibold mt-4">2. How We Use Information</h3>
              <p>We use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, and provide customer support.</p>
              
              <h3 className="text-white font-semibold mt-4">3. Data Sharing</h3>
              <p>We may share your information with our service providers, business partners, or in connection with a corporate transaction. We will not sell your personal data to third parties without your explicit consent.</p>
            </>
          ) : (
            <>
              <h3 className="text-white font-semibold mt-4">1. Acceptance of Terms</h3>
              <p>By accessing and using this logistics platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
              
              <h3 className="text-white font-semibold mt-4">2. User Conduct</h3>
              <p>You agree to use the platform only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others or otherwise cause damage to the site or the content.</p>
              
              <h3 className="text-white font-semibold mt-4">3. Limitation of Liability</h3>
              <p>In no event shall LoadLink, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
