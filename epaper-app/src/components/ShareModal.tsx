'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Facebook, Twitter, Send } from 'lucide-react';

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
            <Facebook size={22} className="mb-1" />
            <span className="text-xs font-bold">Facebook</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-2xl border border-sky-200 transition active:scale-95"
          >
            <Twitter size={22} className="mb-1" />
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