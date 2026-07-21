'use client';

import React from 'react';

interface ThumbnailsProps {
  pages: { pageNumber: number; imageUrl: string }[];
  currentPage: number;
  setCurrentPage: (pg: number) => void;
}

export default function Thumbnails({ pages, currentPage, setCurrentPage }: ThumbnailsProps) {
  return (
    <div className="md:col-span-3 flex flex-col gap-3 max-h-[82vh] overflow-y-auto pr-1">
      {pages.map((pg) => (
        <div 
          key={pg.pageNumber} 
          onClick={() => setCurrentPage(pg.pageNumber)}
          className={`cursor-pointer border-2 rounded-lg p-1.5 transition bg-white text-center shadow-sm ${
            currentPage === pg.pageNumber 
              ? 'border-emerald-800 ring-2 ring-emerald-600 shadow' 
              : 'border-slate-200 hover:border-slate-400'
          }`}
        >
          {/* A4 Format Thumbnail Aspect Ratio */}
          <div className="w-full aspect-[1/1.414] bg-slate-100 rounded overflow-hidden flex items-center justify-center">
            {pg.imageUrl ? (
              <img 
                src={pg.imageUrl} 
                alt={`Page No ${pg.pageNumber}`} 
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400">No Image</span>
            )}
          </div>
          <span className="text-xs font-semibold mt-1 inline-block text-slate-600">
            Page No {pg.pageNumber}
          </span>
        </div>
      ))}

      {/* Left Vertical Ad */}
      <div className="border-2 border-emerald-900 bg-emerald-900 text-white p-4 rounded-lg text-center text-xs font-semibold mt-2 shadow">
        To Place Your Advertisement of 300 × 600 px<br/><br/>
        <span className="text-sm font-extrabold text-amber-300">Contact: +91 8002397082</span>
      </div>
    </div>
  );
}