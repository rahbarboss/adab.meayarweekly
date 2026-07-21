'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Thumbnails from '@/components/Thumbnails';
import Viewer from '@/components/Viewer';
import ShareModal from '@/components/ShareModal';
import { initialPapers, getPaperFromDB } from '@/lib/data';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState("2026-07-21");
  const [currentPage, setCurrentPage] = useState(1);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pages, setPages] = useState<{ pageNumber: number; imageUrl: string }[]>(initialPapers[0].pages);

  useEffect(() => {
    async function loadPaper() {
      try {
        const dbPaper = await getPaperFromDB(selectedDate);
        if (dbPaper && dbPaper.pages && dbPaper.pages.length > 0) {
          setPages(dbPaper.pages);
        } else {
          const defaultPaper = initialPapers.find(p => p.date === selectedDate) || initialPapers[0];
          setPages(defaultPaper.pages);
        }
      } catch (err) {
        console.error("Error reading IndexedDB", err);
      }
    }
    loadPaper();
  }, [selectedDate]);

  const activePageObj = pages.find(p => p.pageNumber === currentPage) || pages[0] || { imageUrl: '', pageNumber: 1 };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 flex flex-col items-center p-2 sm:p-4">
      
      <Header 
        selectedDate={selectedDate}
        setSelectedDate={(d) => {
          setSelectedDate(d);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={pages.length}
        onOpenShare={() => setIsShareOpen(true)}
      />

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-4">
        <Thumbnails 
          pages={pages} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
        />

        <Viewer 
          imageUrl={activePageObj.imageUrl} 
          currentPage={currentPage} 
          totalPages={pages.length} 
        />
      </div>

      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
      />

    </div>
  );
}