// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function Viewer({ pages, currentPageIndex }: any) {
  const [zoom, setZoom] = useState(100);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Jab page change ho, toh Zoom aur Scroll dono reset ho jayenge
  useEffect(() => {
    setZoom(100);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [currentPageIndex]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 50, 400)); // Max 400% zoom
  const handleZoomOut = () => setZoom(z => Math.max(z - 50, 100)); // Min 100% zoom
  const handleReset = () => setZoom(100);

  if (!pages || pages.length === 0) return null;
  const currentPage = pages[currentPageIndex];

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/40 rounded-xl overflow-hidden group">

      {/* 🔍 ZOOM CONTROLS (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1.5 rounded-xl shadow-2xl opacity-70 group-hover:opacity-100 transition-opacity">
        <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition active:scale-95" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} disabled={zoom <= 100} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <div className="w-px h-5 bg-slate-700 mx-1"></div>
        <button onClick={handleReset} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition active:scale-95" title="Reset Zoom">
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 📜 SCROLLABLE PAPER AREA (Horizontal & Vertical Scrollbars) */}
      <div
        ref={scrollContainerRef}
        // Ye CSS code premium Dark Scrollbars add karta hai jo aapne image me dikhaye
        className="w-full h-full overflow-auto p-2 scroll-smooth [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-slate-900/50 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
      >
        <div
          className="mx-auto transition-all duration-300 ease-out origin-top flex justify-center items-start"
          style={{
            width: zoom === 100 ? '100%' : `${zoom}%`,
            height: zoom === 100 ? '100%' : 'auto',
            minWidth: '100%'
          }}
        >
          <img
            src={currentPage.imageUrl}
            alt={`Page ${currentPage.pageNumber}`}
            className="bg-white shadow-2xl transition-all duration-300"
            style={{
              width: zoom === 100 ? 'auto' : '100%',
              height: zoom === 100 ? '100%' : 'auto',
              maxHeight: zoom === 100 ? '100%' : 'none',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

    </div>
  );
}