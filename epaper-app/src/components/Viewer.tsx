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

  const handleZoomIn = () => setZoom(z => Math.min(z + 50, 400)); 
  const handleZoomOut = () => setZoom(z => Math.max(z - 50, 100)); 
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

      {/* 📜 SCROLLABLE PAPER AREA */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-slate-900/50 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
      >
        {/* 🌟 Yahan pb-24 (padding-bottom) lagaya hai taaki page niche se bilkul na kate 🌟 */}
        <div className="w-full min-h-full flex justify-center items-start p-2 pb-24">
          <div
            className="transition-all duration-300 ease-out origin-top flex justify-center"
            style={{
              width: zoom === 100 ? '100%' : `${zoom}%`,
              maxWidth: zoom === 100 ? '1200px' : 'none' // Badi screens par zyada na phaile uske liye
            }}
          >
            <img
              src={currentPage.imageUrl}
              alt={`Page ${currentPage.pageNumber}`}
              // w-full aur h-auto lagaya hai taaki page pehle ki tarah bada aur clear dikhe
              className="w-full h-auto bg-white shadow-2xl transition-all duration-300" 
            />
          </div>
        </div>
      </div>

    </div>
  );
}