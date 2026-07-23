// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Share2, ChevronLeft, ChevronRight, User, ChevronDown, ExternalLink } from 'lucide-react';
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
    <header className="w-full max-w-[1400px] mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 md:p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 border border-slate-200/80 transition-all duration-300 relative z-30 font-sans mt-2">
      
      {/* 1. ROW 1 (Mobile) / LEFT (PC): Date & Share */}
      <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-3 order-1">
        <div className="relative flex-1 md:flex-none">
          <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
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
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d} className="text-xs font-bold text-slate-400">{d}</span>)}
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
                      <button key={day} disabled={isFuture} onClick={() => handleSelectDay(day)} className={`h-9 w-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-emerald-700 text-white shadow-md scale-105 ring-2 ring-emerald-300' : isFuture ? 'text-slate-300 cursor-not-allowed bg-slate-50' : hasPaperUploaded ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 font-extrabold cursor-pointer hover:scale-105' : 'text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-100'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onOpenShare || onShareClick} className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition">
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* 2. ROW 4 (Mobile) / CENTER-LEFT (PC): Pages Navigation */}
      {totalPages > 0 && (
        <div className="flex w-full md:w-auto items-center justify-center gap-1.5 overflow-x-auto py-2 px-3 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner order-4 md:order-2 mt-1 md:mt-0">
          <button disabled={actualCurrentPage === 0} onClick={handlePrevPage} className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"><ChevronLeft size={18} /></button>
          {Array.from({ length: totalPages }, (_, i) => i).map((pgIndex) => {
            const isActive = actualCurrentPage === pgIndex;
            return (
              <button key={pgIndex} onClick={() => handleGoToPage(pgIndex)} className={`w-8 h-8 text-xs font-extrabold rounded-full transition-all duration-300 flex-shrink-0 ${isActive ? 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-lg scale-110 ring-4 ring-emerald-300/50' : 'bg-white hover:bg-emerald-100/70 text-slate-700 hover:scale-105 border border-slate-200'}`}>
                {pgIndex + 1}
              </button>
            );
          })}
          <button disabled={actualCurrentPage === totalPages - 1} onClick={handleNextPage} className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* 3. ROW 2 (Mobile) / CENTER-RIGHT (PC): Logo */}
      <div className="flex w-full md:w-auto items-center justify-center order-2 md:order-3">
        <div className="h-[60px] w-full max-w-[340px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-2 flex items-center justify-center">
          <img src="https://i.postimg.cc/SKwsxCsv/04.jpg" alt="Darul Huda Punganur" className="w-full h-full object-contain mix-blend-multiply scale-125" />
        </div>
      </div>

      {/* 4. ROW 3 (Mobile) / RIGHT (PC): Visit & Admin */}
      <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 order-3 md:order-4">
        <a href="https://www.dhpc.in" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-3 md:py-2.5 rounded-xl font-black text-sm shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-indigo-600">
          <span className="relative z-10 tracking-wide">VISIT</span>
          <ExternalLink size={16} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out z-0"></div>
        </a>

        <Link href="/admin" title="Admin Login" className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-800 shadow-md transition-all active:scale-90 border border-slate-700 flex-shrink-0">
          <User size={20} />
        </Link>
      </div>

    </header>
  );
}