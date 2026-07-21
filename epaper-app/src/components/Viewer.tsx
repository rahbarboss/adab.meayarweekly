'use client';

import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ViewerProps {
  imageUrl: string;
  currentPage: number;
  totalPages: number;
}

export default function Viewer({ imageUrl, currentPage, totalPages }: ViewerProps) {
  return (
    <div className="md:col-span-9 flex flex-col items-center justify-center">
      
      {/* Red Marked Main Container Fixed in Exact A4 Proportions */}
      <div className="w-full max-w-[680px] aspect-[1/1.414] bg-white border-2 border-slate-300 rounded-xl p-2 shadow-2xl relative flex flex-col items-center justify-between overflow-hidden">
        
        <TransformWrapper 
          initialScale={1} 
          minScale={1} 
          maxScale={4}
          centerOnInit={true}
          disabled={false}
          panning={{ disabled: false }} // Zoom hone par pan hoga, normal me fixed rahega
        >
          {({ zoomIn, zoomOut, resetTransform, state }) => (
            <>
              {/* Floating Zoom Controls Bar */}
              <div className="absolute top-3 right-3 z-30 bg-slate-900/85 text-white p-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-slate-700">
                <button 
                  onClick={() => zoomIn()} 
                  className="p-1.5 hover:bg-slate-700 rounded transition" 
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button 
                  onClick={() => zoomOut()} 
                  className="p-1.5 hover:bg-slate-700 rounded transition" 
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button 
                  onClick={() => resetTransform()} 
                  className="p-1.5 hover:bg-slate-700 rounded transition" 
                  title="Reset Zoom"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Exact A4 Canvas Image View */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg">
                <TransformComponent 
                  wrapperStyle={{ width: "100%", height: "100%" }} 
                  contentStyle={{ 
                    width: "100%", 
                    height: "100%", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center" 
                  }}
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={`Newspaper Page ${currentPage}`} 
                      className="w-full h-full object-fill bg-white shadow-md rounded"
                    />
                  ) : (
                    <div className="text-slate-400 font-semibold text-sm">
                      Paper Page Image Missing
                    </div>
                  )}
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* Page Counter Indicator Inside Frame */}
        <div className="absolute bottom-2 z-20 text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-0.5 rounded-full border border-slate-300 shadow-sm">
          Page {currentPage} of {totalPages}
        </div>

      </div>
    </div>
  );
}