'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Share2, ChevronLeft, ChevronRight, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getAllPapersFromDB } from '@/lib/data';

interface HeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onOpenShare: () => void;
}

export default function Header({
  selectedDate,
  setSelectedDate,
  currentPage,
  setCurrentPage,
  totalPages,
  onOpenShare
}: HeaderProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadedDates, setUploadedDates] = useState<string[]>([]);

  // Fixed Today Date: 2026-07-21
  const todayStr = "2026-07-21";
  const todayDateObj = new Date(todayStr);

  const currentDateObj = new Date(selectedDate);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth() || 6);

  // Fetch Published Papers Dates from Database
  useEffect(() => {
    async function fetchDates() {
      try {
        const papers = await getAllPapersFromDB();
        const dates = papers.map((p) => p.date);
        // Default initial date included
        if (!dates.includes("2026-07-21")) dates.push("2026-07-21");
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

    // Prevent selecting future dates or unuploaded dates
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

  return (
    <header className="w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 transition-all duration-300 relative z-30 font-sans">
      
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

          {/* CUSTOM ANIMATED CALENDAR POPUP */}
          {isCalendarOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10" 
                onClick={() => setIsCalendarOpen(false)} 
              />

              <div className="absolute left-0 mt-3 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <span className="font-extrabold text-slate-800 text-base">
                    {monthNames[viewMonth]} {viewYear}
                  </span>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleMonthChange(-1)} 
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={() => handleMonthChange(1)} 
                      className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d} className="text-xs font-bold text-slate-400">{d}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`blank-${i}`} />
                  ))}

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
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-md scale-105 ring-2 ring-emerald-300'
                            : isFuture
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                            : hasPaperUploaded
                            ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 font-extrabold cursor-pointer hover:scale-105'
                            : 'text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-100'
                        }`}
                        title={
                          isFuture
                            ? 'Future Date (Not Allowed)'
                            : hasPaperUploaded
                            ? 'Newspaper Available'
                            : 'No Newspaper Uploaded'
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-2 border-t flex items-center justify-between text-xs font-bold">
                  <button 
                    onClick={() => {
                      setSelectedDate('2026-07-21');
                      setIsCalendarOpen(false);
                    }} 
                    className="text-emerald-700 hover:underline"
                  >
                    Today (21 July)
                  </button>
                  <button 
                    onClick={() => setIsCalendarOpen(false)} 
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <button 
          onClick={onOpenShare}
          className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md border border-teal-600 transition"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Animated Page Numbers List (1, 2, 3...) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
          const isActive = currentPage === pg;
          return (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`w-8 h-8 text-xs font-extrabold rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-lg scale-110 ring-4 ring-emerald-300/50' 
                  : 'bg-white hover:bg-emerald-100/70 text-slate-700 hover:scale-105 border border-slate-200'
              }`}
            >
              {pg}
            </button>
          );
        })}

        <button 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 disabled:opacity-30 shadow-sm transition active:scale-90"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Header Banner Ad & Admin Icon */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:block border-2 border-emerald-800/80 bg-emerald-50/80 text-emerald-900 px-4 py-1.5 text-xs font-bold rounded-xl text-center shadow-sm">
          To Place Your Advertisement of 1200×200 px<br/>
          <span className="text-sm font-extrabold text-emerald-800">Contact: +91 8002397082</span>
        </div>

        <Link 
          href="/admin" 
          title="Admin Login" 
          className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-emerald-800 shadow-md transition-all active:scale-90 border border-slate-700"
        >
          <User size={18} />
        </Link>
      </div>

    </header>
  );
}