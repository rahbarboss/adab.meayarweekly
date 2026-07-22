'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, selectedDate }: any) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Adab-e-Meayar Weekly E-Paper (${selectedDate})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      
      {/* 🌟 Animated Modal Container */}
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-90 duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 hover:rotate-90 transition-all duration-300">
          <X size={20} />
        </button>

        {/* 🌟 Bouncing Header */}
        <div className="text-center mb-6 mt-2">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
            <Share2 size={30} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Share E-Paper</h3>
          <p className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 inline-block px-3 py-1 rounded-full">{selectedDate} Edition</p>
        </div>

        {/* 🌟 Dynamic Social Media Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          
          {/* WhatsApp */}
          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 shadow-sm border border-green-100 group-hover:border-green-500">
              <Send size={24} className="text-green-500 group-hover:text-white" />
            </div>
            <span className="text-xs font-bold text-slate-600">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 shadow-sm border border-blue-100 group-hover:border-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500 group-hover:text-white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </div>
            <span className="text-xs font-bold text-slate-600">Facebook</span>
          </a>

          {/* Twitter/X */}
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-black group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-slate-600 group-hover:text-white"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </div>
            <span className="text-xs font-bold text-slate-600">Twitter</span>
          </a>
        </div>

        {/* Copy Link Box */}
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 p-1.5 rounded-2xl">
          <input type="text" readOnly value={currentUrl} className="bg-transparent outline-none flex-1 px-3 text-xs font-bold text-slate-500 overflow-hidden whitespace-nowrap" />
          <button onClick={handleCopy} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-white text-xs transition-all duration-300 active:scale-95 ${copied ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700'}`}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

      </div>
    </div>
  );
}