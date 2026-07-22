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

  // Load All Published Papers Dates
  useEffect(() => {
    async function loadDates() {
      const allPapers = await getAllPapersFromDB();
      const dates = allPapers.map(p => p.date);
      setPublishedDates(dates);
      
      // If today has paper, select today, else select most recent published date
      if (!dates.includes(todayStr) && dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    }
    loadDates();
  }, [todayStr]);

  // Load Paper Data when Date Changes
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

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col font-sans select-none overflow-x-hidden">
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        publishedDates={publishedDates}
        totalPages={currentPaper?.pages?.length || 0}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
        onShareClick={() => setIsShareOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden my-2 px-2 gap-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-emerald-400 font-bold text-lg animate-pulse min-h-[60vh]">
            Loading E-Paper Edition...
          </div>
        ) : currentPaper && currentPaper.pages && currentPaper.pages.length > 0 ? (
          <>
            <div className="hidden md:block w-64 lg:w-72 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-2 overflow-y-auto max-h-[calc(100vh-120px)]">
              <Thumbnails
                pages={currentPaper.pages}
                currentPage={currentPageIndex} 
                onSelectPage={(index) => setCurrentPageIndex(index)}
              />
            </div>

            <div className="flex-1 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 p-2 flex items-center justify-center relative min-h-[75vh]">
              <Viewer
                pages={currentPaper.pages}
                currentPage={currentPageIndex} 
                onPageChange={(index) => setCurrentPageIndex(index)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 my-8">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-emerald-500 font-bold text-2xl">
              🗞️
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">No Newspaper Published for {selectedDate}</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Is date ke liye abhi koi newspaper upload nahi hua hai. Kripya kisi doosri date ko select karein.
            </p>
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