'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  if (!isOpen) return null;

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    let shareUrl = "";

    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
    if (platform === 'telegram') shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    if (platform === 'gmail') shareUrl = `mailto:?subject=Newspaper E-Paper&body=${encodeURIComponent(url)}`;

    if (shareUrl) window.open(shareUrl, '_blank');
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-black"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4 text-slate-800">Share E-Paper</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleShare('whatsapp')} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm font-medium">WhatsApp</button>
          <button onClick={() => handleShare('telegram')} className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded text-sm font-medium">Telegram</button>
          <button onClick={() => handleShare('gmail')} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded text-sm font-medium">Gmail</button>
          <button onClick={() => handleShare('twitter')} className="bg-black hover:bg-slate-800 text-white p-2 rounded text-sm font-medium">Twitter</button>
          <button onClick={() => handleShare('copy')} className="col-span-2 bg-slate-700 hover:bg-slate-800 text-white p-2 rounded text-sm font-medium">Copy Link</button>
        </div>
      </div>
    </div>
  );
}