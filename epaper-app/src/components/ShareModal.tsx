'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export default function ShareModal({ isOpen, onClose, selectedDate }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTitle = `Adab-e-Meayar Newspaper - ${selectedDate || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <Share2 size={20} className="text-emerald-700" />
            <span>Share E-Paper</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5 font-medium">
          Share this edition <span className="font-bold text-emerald-800">({selectedDate})</span> with your friends & family:
        </p>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 transition active:scale-95"
          >
            <Send size={22} className="mb-1" />
            <span className="text-xs font-bold">WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl border border-blue-200 transition active:scale-95"
          >
            {/* Custom Facebook Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
            <span className="text-xs font-bold">Facebook</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-2xl border border-sky-200 transition active:scale-95"
          >
            {/* Custom Twitter Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
            <span className="text-xs font-bold">Twitter</span>
          </a>
        </div>

        {/* Copy Link Input Section */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <input 
            type="text" 
            readOnly 
            value={currentUrl} 
            className="bg-transparent text-xs text-slate-600 px-2 flex-1 outline-none font-medium overflow-ellipsis"
          />
          <button 
            onClick={handleCopyLink}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

      </div>
    </div>
  );
}