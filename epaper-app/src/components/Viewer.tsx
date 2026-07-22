'use client';

import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function Viewer({ pages, currentPage, currentPageIndex }: any) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 100% Fail-Proof Logic: Ye currentPage aur currentPageIndex dono ko support karega
  const activeIndex = currentPage !== undefined ? currentPage : (currentPageIndex !== undefined ? currentPageIndex : 0);
  const page = pages?.[activeIndex];

  // Jab page change ho, toh Zoom aur Rotation reset ho jaye
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [activeIndex]);

  // Agar galti se image missing ho
  if (!page || !page.imageUrl) {
    return (
      <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl">
        <span className="text-slate-400 font-bold text-xl mb-2">Paper Page Image Missing</span>
        <span className="text-slate-300 text-sm">Please re-upload this page from Admin panel</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl">
      
      {/* 🔍 Top Right Floating Zoom & Rotate Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-2xl">
        <button onClick={() => setScale(s => Math.min(s + 0.25, 3))} className="p-2 text-slate-300 hover:text-white hover:bg-emerald-600 rounded-lg transition-all active:scale-95" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} className="p-2 text-slate-300 hover:text-white hover:bg-emerald-600 rounded-lg transition-all active:scale-95" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={() => setRotation(r => r + 90)} className="p-2 text-slate-300 hover:text-white hover:bg-emerald-600 rounded-lg transition-all active:scale-95" title="Rotate">
          <RotateCw size={20} />
        </button>
      </div>

      {/* 📰 MASSIVE A4 E-PAPER IMAGE CONTAINER */}
      <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
        <img
          src={page.imageUrl}
          alt={`E-Paper Page ${page.pageNumber}`}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: scale === 1 && rotation === 0 ? 'transform 0.3s ease-out' : 'none'
          }}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain bg-white shadow-2xl"
        />
      </div>
      
    </div>
  );
}