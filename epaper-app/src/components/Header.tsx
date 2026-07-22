// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Share2, ChevronLeft, ChevronRight, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getAllPapersFromDB } from '@/lib/data';

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

  // Dynamically get TODAY's date
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  // Safe page navigation handlers
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
    <header className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 transition-all duration-300 relative z-30 font-sans mt-2">
      
      {/* Date Picker & Share Button Group */}
      <div className="flex items-center gap-3 flex-wrap">
        
        {/* Animated Custom Calendar Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2.5 text-sm shadow-md hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-700 cursor-pointer"
          >
            <Calendar size={18} className="animate-pulse text-emerald-300" />
            <span>{selectedDate.split('-').reverse().join('-')}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCalendarOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setIsCalendarOpen(false)} />
              <div className="absolute left-0 mt-3 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <span className="font-extrabold text-slate-800 text-base">{monthNames[viewMonth]} {viewYear}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMonthChange(-1)} className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"><ChevronLeft size={18} /></button>
                    <button onClick={() => handleMonthChange(1)} className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"><ChevronRight size={18} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d} className="text-xs font-bold text-slate-400">{d}</span>
                  ))}
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
                      <button
                        key={day}
                        disabled={isFuture}
                        onClick={() => handleSelectDay(day)}
                        className={`h-9 w-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'bg-emerald-700 text-white shadow-md scale-105 ring-2 ring-emerald-300' : isFuture ? 'text-slate-300 cursor-not-allowed bg-slate-50' : hasPaperUploaded ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 font-extrabold cursor-pointer hover:scale-105' : 'text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <button 
          onClick={onOpenShare || onShareClick}
          className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md border border-teal-600 transition"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Animated Page Numbers List (1, 2, 3...) */}
      {totalPages > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            disabled={actualCurrentPage === 0}
            onClick={handlePrevPage}
            className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i).map((pgIndex) => {
            const isActive = actualCurrentPage === pgIndex;
            return (
              <button
                key={pgIndex}
                onClick={() => handleGoToPage(pgIndex)}
                className={`w-8 h-8 text-xs font-extrabold rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-lg scale-110 ring-4 ring-emerald-300/50' 
                    : 'bg-white hover:bg-emerald-100/70 text-slate-700 hover:scale-105 border border-slate-200'
                }`}
              >
                {pgIndex + 1}
              </button>
            );
          })}

          <button 
            disabled={actualCurrentPage === totalPages - 1}
            onClick={handleNextPage}
            className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Header Banner Ad & Admin Icon */}
      <div className="flex items-center gap-3">
        
        {/* 🟢 BADA AUR LAMBA LOGO 🟢 */}
        <div className="hidden lg:flex items-center justify-center h-[56px] w-[340px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-2">
          <img 
            src="https://i.postimg.cc/SKwsxCsv/04.jpg" 
            alt="Darul Huda Punganur" 
            className="w-full h-full object-contain mix-blend-multiply scale-125"
          />
        </div>

        <Link 
          href="/admin" 
          title="Admin Login" 
          className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-800 shadow-md transition-all active:scale-90 border border-slate-700"
        >
          <User size={20} />
        </Link>
      </div>

    </header>
  );
}