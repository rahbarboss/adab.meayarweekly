'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Thumbnails from '@/components/Thumbnails';
import Viewer from '@/components/Viewer';
import ShareModal from '@/components/ShareModal';
import { getPaperFromDB, Newspaper } from '@/lib/data';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('2026-07-21');
  const [currentPage, setCurrentPage] = useState(1);
  const [paper, setPaper] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Fetch paper from Supabase cloud on date change
  useEffect(() => {
    async function loadPaper() {
      setLoading(true);
      const data = await getPaperFromDB(selectedDate);
      setPaper(data);
      setCurrentPage(1);
      setLoading(false);
    }
    loadPaper();
  }, [selectedDate]);

  const totalPages = paper?.pages.length || 1;
  const currentImageUrl = paper?.pages[currentPage - 1]?.imageUrl || paper?.pages[0]?.imageUrl || '';

  return (
    <main className="min-h-screen bg-slate-200 flex flex-col items-center p-3 sm:p-6 font-sans">
      
      {/* Top Controls Header */}
      <Header 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main E-Paper Viewer & Sidebar Layout */}
      {loading ? (
        <div className="w-full max-w-6xl h-[70vh] flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-bold animate-pulse">Loading Newspaper from Cloud Database...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 items-start">
          
          {/* Left Thumbnails List */}
          <Thumbnails 
            pages={paper?.pages || []}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />

          {/* Center Main Newspaper Paper Canvas */}
          <Viewer 
            imageUrl={currentImageUrl}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}

      {/* Share Modal Popup */}
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        selectedDate={selectedDate}
      />

    </main>
  );
}