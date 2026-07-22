'use client';
import React from 'react';

export default function Thumbnails({ pages, currentPage, currentPageIndex, onSelectPage }: any) {
  if (!pages || pages.length === 0) return null;
  
  // 100% working logic for active page
  const activeIdx = currentPage !== undefined ? currentPage : (currentPageIndex !== undefined ? currentPageIndex : 0);

  return (
    <div className="flex flex-col gap-5 p-3 pb-10">
      {pages.map((page: any, index: number) => {
        const isActive = activeIdx === index;
        return (
          <div
            key={index}
            onClick={() => onSelectPage(index)}
            className={`relative w-full cursor-pointer overflow-hidden rounded-xl border-4 transition-all duration-300 ${
              isActive
                ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 z-10'
                : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600 hover:scale-100'
            }`}
          >
            {/* pointer-events-none ensures image doesn't block the click */}
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-auto object-cover pointer-events-none"
            />
            <div className="bg-slate-900 text-white text-xs font-bold py-2 text-center border-t border-slate-800">
              Page No {page.pageNumber}
            </div>
          </div>
        );
      })}
    </div>
  );
}