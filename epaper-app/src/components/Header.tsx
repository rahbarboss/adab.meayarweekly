// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Share2, ChevronLeft, ChevronRight, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getAllPapersFromDB } from '../lib/data';
export default function Header({
  selectedDate,
  setSelectedDate,
  publishedDates,
  totalPages,
  currentPage,
  setCurrentPage,
  currentPageIndex,
  setCurrentPageIndex,
  onOpenShare,
  onShareClick
}: any) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadedDates, setUploadedDates] = useState<string[]>([]);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0]; 

  const currentDateObj = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear() || todayObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth() || todayObj.getMonth());

  useEffect(() => {
    async function fetchDates() {
      try {
        const papers = await getAllPapersFromDB();
        const dates = papers.map((p) => p.date);
        setUploadedDates(dates);
      } catch (err) {
        console.error("Error fetching dates", err);
      }
    }
    fetchDates();
  }, [isCalendarOpen]);

  useEffect(() => {
    if (clickCount > 0 && clickCount < 5) {
      const timer = setTimeout(() => setClickCount(0), 1500); 
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleCalendarClick = () => {
    setIsCalendarOpen(!isCalendarOpen);
    if (!showAdmin) {
      setClickCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          setShowAdmin(true);
          setIsCalendarOpen(false); 
          return 0;
        }
        return newCount;
      });
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const newDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

    if (newDateStr > todayStr) return;
    if (!uploadedDates.includes(newDateStr)) {
      alert(`${newDateStr} ko koi newspaper upload nahi hua hai!`);
      return;
    }
    setSelectedDate(newDateStr);
    setIsCalendarOpen(false);
  };

  const handleMonthChange = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; } 
    else if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const actualCurrentPage = currentPageIndex !== undefined ? currentPageIndex : (currentPage !== undefined ? currentPage - 1 : 0);
  
  const handlePrevPage = () => {
    if (setCurrentPageIndex) setCurrentPageIndex(actualCurrentPage - 1);
    else if (setCurrentPage) setCurrentPage(actualCurrentPage);
  };

  const handleNextPage = () => {
    if (setCurrentPageIndex) setCurrentPageIndex(actualCurrentPage + 1);
    else if (setCurrentPage) setCurrentPage(actualCurrentPage + 2);
  };

  const handleGoToPage = (index: number) => {
    if (setCurrentPageIndex) setCurrentPageIndex(index);
    else if (setCurrentPage) setCurrentPage(index + 1);
  };

  return (
    // 🌟 FULLY RESPONSIVE MOBILE OPTIMIZED WRAPPER 🌟
    <div className="w-full flex justify-center items-center pt-2 pb-2 px-1 z-40 relative">
      {/* flex-row aur flex-wrap lagaya hai taaki ek hi line me fit hone ki koshish kare */}
      <header className="flex flex-row flex-wrap items-center justify-center gap-1.5 md:gap-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg p-1.5 md:px-4 md:py-2 border border-slate-200/80 transition-all duration-300 font-sans w-auto max-w-[98%]">
        
        {/* 1. Date & Share */}
        <div className="flex items-center justify-center gap-1.5 md:gap-2">
          <div className="relative">
            <button 
              onClick={handleCalendarClick} 
              className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Calendar size={14} className="animate-pulse text-emerald-300 md:w-[18px] md:h-[18px]" />
              <span>{selectedDate.split('-').reverse().join('-')}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 md:w-[16px] md:h-[16px] ${isCalendarOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCalendarOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setIsCalendarOpen(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 z-50 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 md:p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <span className="font-extrabold text-slate-800 text-sm md:text-base">{monthNames[viewMonth]} {viewYear}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-slate-100 text-slate-700 rounded-lg transition"><ChevronLeft size={18} /></button>
                      <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-slate-100 text-slate-700 rounded-lg transition"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d} className="text-[10px] md:text-xs font-bold text-slate-400">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`blank-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const formattedMonth = String(viewMonth + 1).padStart(2, '0');
                      const formattedDay = String(day).padStart(2, '0');
                      const thisDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
                      const isFuture = thisDateStr > todayStr;
                      const hasPaperUploaded = uploadedDates.includes(thisDateStr);
                      const isSelected = selectedDate === thisDateStr;

                      return (
                        <button key={day} disabled={isFuture} onClick={() => handleSelectDay(day)} className={`h-8 w-8 md:h-9 md:w-9 text-[10px] md:text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-emerald-700 text-white shadow-md scale-105 ring-2 ring-emerald-300' : isFuture ? 'text-slate-300 cursor-not-allowed bg-slate-50' : hasPaperUploaded ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 font-extrabold cursor-pointer hover:scale-105' : 'text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-100'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={onOpenShare || onShareClick} className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md transition">
            <Share2 size={14} className="md:w-[16px] md:h-[16px]" />
            <span className="md:inline">Share</span>
          </button>
        </div>

        {/* 2. Pages Navigation */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-1 md:gap-1.5 py-1 px-1.5 md:py-1.5 md:px-2 bg-slate-100/80 rounded-lg md:rounded-xl border border-slate-200 shadow-inner">
            <button disabled={actualCurrentPage === 0} onClick={handlePrevPage} className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"><ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" /></button>
            {Array.from({ length: totalPages }, (_, i) => i).map((pgIndex) => {
              const isActive = actualCurrentPage === pgIndex;
              return (
                <button key={pgIndex} onClick={() => handleGoToPage(pgIndex)} className={`w-6 h-6 md:w-7 md:h-7 text-[10px] md:text-xs font-extrabold rounded-full transition-all duration-300 flex-shrink-0 ${isActive ? 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-md scale-110 ring-2 md:ring-4 ring-emerald-300/50' : 'bg-white hover:bg-emerald-100/70 text-slate-700 hover:scale-105 border border-slate-200'}`}>
                  {pgIndex + 1}
                </button>
              );
            })}
            <button disabled={actualCurrentPage === totalPages - 1} onClick={handleNextPage} className="p-1 md:p-1.5 rounded-md md:rounded-lg bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"><ChevronRight size={16} className="md:w-[18px] md:h-[18px]" /></button>
          </div>
        )}

        {/* 3. SECRET ADMIN BUTTON */}
        {showAdmin && (
          <div className="flex items-center justify-center animate-in fade-in zoom-in duration-300">
            <Link href="/admin" title="Admin Portal" className="group flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900 text-emerald-400 rounded-lg md:rounded-xl hover:bg-slate-800 shadow-xl transition-all active:scale-95 border border-emerald-500/40">
              <User size={14} className="animate-pulse md:w-[16px] md:h-[16px]" />
              <span className="text-[10px] md:text-xs font-black tracking-wide">ADMIN</span>
            </Link>
          </div>
        )}

      </header>
    </div>
  );
}