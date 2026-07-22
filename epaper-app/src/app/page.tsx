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
  
  // 🌟 NEW: Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // 🌟 NEW: Browser Auto-play block prevention
  const [hasInteracted, setHasInteracted] = useState(false);

  // Mark user interaction to allow Sound playback
  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // Fetch all dates
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

  // Fetch selected paper
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

  // 🌟 NEW: Play Realistic Page Turn Sound when page index changes!
  useEffect(() => {
    if (hasInteracted && !loading && currentPaper && currentPaper.pages.length > 0) {
      // Free open-source page turn sound by Google
      const pageSound = new Audio('https://actions.google.com/sounds/v1/foley/book_page_turn.ogg');
      pageSound.volume = 0.6; // Not too loud, just perfect
      pageSound.play().catch(e => console.log('Sound playback prevented by browser'));
    }
  }, [currentPageIndex]);

  return (
    <main className={`min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-700 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER: Passing Dark Mode Props */}
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
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden my-2 px-2 gap-2 z-10">
        {loading ? (
          // 🌟 NEW: NEXT-LEVEL SHIMMER LOADING EFFECT (SKELETON) 🌟
          <>
            {/* Sidebar Skeleton */}
            <div className={`hidden md:flex flex-col gap-5 w-64 lg:w-72 rounded-2xl border p-3 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={`w-full h-64 rounded-xl animate-pulse shadow-sm ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'}`}></div>
              ))}
            </div>

            {/* Viewer Main Skeleton */}
            <div className={`flex-1 rounded-2xl border p-2 flex items-center justify-center relative min-h-[75vh] transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className={`w-full max-w-3xl h-[85%] rounded-3xl animate-pulse flex flex-col items-center justify-center gap-6 shadow-inner ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-100/80'}`}>
                
                {/* Pulsing Core */}
                <div className="relative flex items-center justify-center">
                  <div className={`absolute w-32 h-32 rounded-full animate-ping opacity-30 ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-400'}`}></div>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-slate-700 text-3xl' : 'bg-white border border-slate-200 text-3xl'}`}>🗞️</div>
                </div>

                <div className={`h-6 w-64 rounded-full mt-4 ${isDarkMode ? 'bg-slate-700/80' : 'bg-slate-300'}`}></div>
                <div className={`h-4 w-40 rounded-full ${isDarkMode ? 'bg-slate-700/60' : 'bg-slate-200'}`}></div>
              </div>
            </div>
          </>
        ) : currentPaper && currentPaper.pages && currentPaper.pages.length > 0 ? (
          
          // ACTUAL E-PAPER CONTENT
          <>
            <div className={`hidden md:block w-64 lg:w-72 backdrop-blur rounded-2xl border p-2 overflow-y-auto max-h-[calc(100vh-120px)] transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xl'}`}>
              <Thumbnails
                pages={currentPaper.pages}
                currentPageIndex={currentPageIndex} 
                onSelectPage={(index: number) => setCurrentPageIndex(index)}
              />
            </div>

            <div className={`flex-1 backdrop-blur rounded-2xl border p-2 flex items-center justify-center relative min-h-[75vh] transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <Viewer
                pages={currentPaper.pages}
                currentPageIndex={currentPageIndex} 
                onPageChange={(index: number) => setCurrentPageIndex(index)}
              />
            </div>
          </>

        ) : (
          
          // NO PAPER PUBLISHED 
          <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center rounded-3xl border my-8 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-white border-slate-200 shadow-2xl text-slate-600'}`}>
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-bold text-4xl shadow-lg border border-slate-700 animate-bounce">🗞️</div>
            <h2 className="text-2xl font-black mb-3 text-emerald-500">No Edition Available</h2>
            <p className="text-sm font-semibold max-w-md opacity-80">Is date ({selectedDate}) ke liye abhi koi newspaper upload nahi hua hai. Kripya Calendar se kisi doosri date ko select karein.</p>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        selectedDate={selectedDate}
      />
    </main>
  );
}