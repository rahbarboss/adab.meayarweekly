// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
// 🌟 FIX: '@/' hata kar '../' lagaya gaya hai
import Header from '../components/Header';
import Viewer from '../components/Viewer';
import Thumbnails from '../components/Thumbnails';
import ShareModal from '../components/ShareModal';
import { getPaperFromDB, getAllPapersFromDB, Newspaper } from '../lib/data';

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
    <main className="h-screen w-screen flex flex-col md:flex-row font-sans select-none overflow-hidden bg-slate-950 text-slate-100 p-2 gap-2">
      
      {/* 👈 LEFT SIDEBAR: THUMBNAILS */}
      {!loading && currentPaper && currentPaper.pages.length > 0 && (
        <div className="hidden md:block w-64 lg:w-72 backdrop-blur rounded-2xl border p-2 overflow-y-auto h-full bg-slate-900/80 border-slate-800 flex-shrink-0">
          <Thumbnails pages={currentPaper.pages} currentPageIndex={currentPageIndex} onSelectPage={(index: number) => setCurrentPageIndex(index)} />
        </div>
      )}

      {/* 👉 RIGHT SIDE: HEADER + VIEWER (Ye dono ab ek sath center rahenge!) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER */}
        <div className="w-full flex-shrink-0 z-50">
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

        {/* VIEWER AREA */}
        <div className="flex-1 backdrop-blur rounded-2xl border p-1 md:p-2 flex items-center justify-center relative bg-slate-900/50 border-slate-800 overflow-hidden mt-1 lg:mt-2">
          {loading ? (
            <div className="w-full max-w-3xl h-[85%] rounded-3xl animate-pulse flex flex-col items-center justify-center gap-6 shadow-inner bg-slate-800/40">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-32 h-32 rounded-full animate-ping opacity-30 bg-emerald-500"></div>
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg bg-slate-700 text-3xl">🗞️</div>
              </div>
              <div className="h-6 w-64 rounded-full mt-4 bg-slate-700/80"></div>
            </div>
          ) : currentPaper && currentPaper.pages && currentPaper.pages.length > 0 ? (
            <Viewer pages={currentPaper.pages} currentPageIndex={currentPageIndex} onPageChange={(index: number) => setCurrentPageIndex(index)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-3xl border my-8 bg-slate-900/40 border-slate-800/80 text-slate-400 w-full h-full">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-emerald-500 font-bold text-4xl shadow-lg border border-slate-700 animate-bounce">🗞️</div>
              <h2 className="text-2xl font-black mb-3 text-emerald-500">No Edition Available</h2>
            </div>
          )}
        </div>

      </div>

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} selectedDate={selectedDate} />
    </main>
  );
}