// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Viewer from '@/components/Viewer';
import Thumbnails from '@/components/Thumbnails';
import ShareModal from '@/components/ShareModal';
import { getPaperFromDB, getAllPapersFromDB, Newspaper } from '@/lib/data';

export default function Home() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentPaper, setCurrentPaper] = useState<Newspaper | null>(null);
  const [publishedDates, setPublishedDates] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    async function loadDates() {
      const allPapers = await getAllPapersFromDB();
      const dates = allPapers.map(p => p.date);
      setPublishedDates(dates);
      if (!dates.includes(todayStr) && dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    }
    loadDates();
  }, [todayStr]);

  useEffect(() => {
    async function fetchPaper() {
      setLoading(true);
      const paper = await getPaperFromDB(selectedDate);
      setCurrentPaper(paper);
      setCurrentPageIndex(0);
      setLoading(false);
    }
    fetchPaper();
  }, [selectedDate]);

  useEffect(() => {
    if (hasInteracted && !loading && currentPaper && currentPaper.pages.length > 0) {
      const pageSound = new Audio('https://actions.google.com/sounds/v1/foley/book_page_turn.ogg');
      pageSound.volume = 0.6; 
      pageSound.play().catch(e => console.log('Sound blocked'));
    }
  }, [currentPageIndex]);

  return (
    <main className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden bg-slate-950 text-slate-100">
      
      <div className="relative z-50">
        <Header
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          publishedDates={publishedDates}
          totalPages={currentPaper?.pages?.length || 0}
          currentPage={currentPageIndex + 1}
          setCurrentPage={(page: number) => setCurrentPageIndex(page - 1)}
          currentPageIndex={currentPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          onOpenShare={() => setIsShareOpen(true)}
          onShareClick={() => setIsShareOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden my-1 md:my-2 px-1 md:px-2 gap-2 z-10 pb-20 md:pb-2">
        {loading ? (
          <>
            <div className="hidden md:flex flex-col gap-5 w-64 lg:w-72 rounded-2xl border p-3 overflow-hidden bg-slate-900/60 border-slate-800">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full h-64 rounded-xl animate-pulse shadow-sm bg-slate-800/80"></div>
              ))}
            </div>
            <div className="flex-1 rounded-2xl border p-2 flex items-center justify-center relative min-h-[75vh] bg-slate-900/40 border-slate-800">
              <div className="w-full max-w-3xl h-[85%] rounded-3xl animate-pulse flex flex-col items-center justify-center gap-6 shadow-inner bg-slate-800/40">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full animate-ping opacity-30 bg-emerald-500"></div>
                  <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-slate-700 text-3xl">🗞️</div>
                </div>
                <div className="h-6 w-64 rounded-full mt-4 bg-slate-700/80"></div>
              </div>
            </div>
          </>
        ) : currentPaper && currentPaper.pages && currentPaper.pages.length > 0 ? (
          
          <>
            {/* DESKTOP THUMBNAILS (Hidden on Mobile) */}
            <div className="hidden md:block w-64 lg:w-72 backdrop-blur rounded-2xl border p-2 overflow-y-auto max-h-[calc(100vh-130px)] bg-slate-900/80 border-slate-800">
              <Thumbnails pages={currentPaper.pages} currentPageIndex={currentPageIndex} onSelectPage={(index: number) => setCurrentPageIndex(index)} />
            </div>

            {/* VIEWER AREA */}
            <div className="flex-1 backdrop-blur rounded-2xl border p-1 md:p-2 flex items-center justify-center relative min-h-[75vh] bg-slate-900/50 border-slate-800 overflow-hidden">
              <Viewer pages={currentPaper.pages} currentPageIndex={currentPageIndex} onPageChange={(index: number) => setCurrentPageIndex(index)} />
              
              {/* 📱 MOBILE THUMBNAILS (Hidden on Desktop) - Anchored to bottom of Viewer */}
              <div className="md:hidden absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-2.5 flex overflow-x-auto gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 custom-scrollbar">
                {currentPaper.pages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`relative flex-shrink-0 w-[4.5rem] h-[6.5rem] rounded-xl overflow-hidden border-[3px] transition-all duration-300 ${currentPageIndex === idx ? 'border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10' : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={p.imageUrl} alt={`Page ${p.pageNumber}`} className="w-full h-full object-cover bg-white" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/0 pt-4 pb-1 text-white text-[10px] font-black text-center">
                      Page {p.pageNumber}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>

        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-3xl border my-8 bg-slate-900/40 border-slate-800/80 text-slate-400">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-bold text-4xl shadow-lg border border-slate-700 animate-bounce">🗞️</div>
            <h2 className="text-2xl font-black mb-3 text-emerald-500">No Edition Available</h2>
          </div>
        )}
      </div>

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} selectedDate={selectedDate} />
    </main>
  );
}