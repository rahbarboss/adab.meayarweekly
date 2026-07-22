// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase, savePaperToDB, getAllPapersFromDB, getPaperFromDB, deletePaperFromDB, Newspaper } from '@/lib/data';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface PageInput {
  pageNumber: number;
  file: File | null;
  previewUrl: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'all_papers'>('upload');

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [pages, setPages] = useState<PageInput[]>([{ pageNumber: 1, file: null, previewUrl: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // All Papers State
  const [publishedPapers, setPublishedPapers] = useState<Newspaper[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Custom Calendar State for Upload Form
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Fetch Published Papers
  const fetchAllPapers = async () => {
    const papers = await getAllPapersFromDB();
    setPublishedPapers(papers);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllPapers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('❌ Galat Username ya Password!');
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...pages];
    updated[index].file = file;
    if (file) {
      updated[index].previewUrl = URL.createObjectURL(file);
    }
    setPages(updated);
  };

  const addPageField = () => {
    setPages([...pages, { pageNumber: pages.length + 1, file: null, previewUrl: '' }]);
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return alert('Select Date');

    setLoading(true);
    setMessage('');

    try {
      const uploadedPages = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.file) {
          const fileExt = page.file.name.split('.').pop();
          const fileName = `${date}_page_${page.pageNumber}_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('newspapers')
            .upload(fileName, page.file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('newspapers')
            .getPublicUrl(fileName);

          uploadedPages.push({ pageNumber: page.pageNumber, imageUrl: publicUrlData.publicUrl });
        } else if (page.previewUrl) {
          uploadedPages.push({ pageNumber: page.pageNumber, imageUrl: page.previewUrl });
        } else {
          throw new Error(`Select file for Page ${page.pageNumber}`);
        }
      }

      await savePaperToDB({ date, pages: uploadedPages });
      setMessage('✅ Paper successfully saved & published to Cloud!');
      fetchAllPapers();
      if (activeTab === 'upload') {
        setPages([{ pageNumber: 1, file: null, previewUrl: '' }]);
      }
    } catch (err: any) {
      setMessage('❌ Error: ' + (err.message || 'Upload failed'));
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Edit Existing Paper
  const handleEditPaper = async (paperDate: string) => {
    const paper = await getPaperFromDB(paperDate);
    if (paper) {
      setDate(paper.date);
      setPages(paper.pages.map(p => ({
        pageNumber: p.pageNumber,
        file: null,
        previewUrl: p.imageUrl
      })));
      setActiveTab('upload');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperDate: string) => {
    if (confirm(`Are you sure you want to delete newspaper for ${paperDate}?`)) {
      setLoading(true);
      const success = await deletePaperFromDB(paperDate);
      if (success) {
        alert('Deleted successfully!');
        fetchAllPapers();
      } else {
        alert('Failed to delete paper');
      }
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // Calendar Helpers
  // --------------------------------------------------------
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const publishedDatesList = publishedPapers.map(p => p.date);
  
  const handleMonthChange = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; } 
    else if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Render Login Shield
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-2">Enter credentials to manage E-Paper</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="admin" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="********" required />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">Login to Admin</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navbar */}
        <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-black text-emerald-400">E-Paper Admin Panel</h1>
            <p className="text-xs text-slate-400 mt-1">Manage publications & Cloud Storage</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'upload' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'}`}
            >
              + Upload Paper
            </button>
            <button
              onClick={() => setActiveTab('all_papers')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'all_papers' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 hover:bg-slate-800 text-slate-400'}`}
            >
              📅 ALL PAPERS
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 px-4 py-2.5 rounded-xl border border-red-800/40 transition">
              Logout
            </button>
          </div>
        </div>

        {/* TAB 1: UPLOAD / EDIT FORM */}
        {activeTab === 'upload' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <span>📰</span> Upload / Edit E-Paper Edition
            </h2>

            {message && (
              <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.includes('✅') ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-red-950/80 border border-red-800 text-red-300'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSavePaper} className="space-y-6">
              
              {/* 🌟 CUSTOM ANIMATED DYNAMIC CALENDAR 🌟 */}
              <div className="relative z-50">
                <label className="block text-sm font-bold text-slate-300 mb-2">Publish Date</label>
                
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-white outline-none focus:border-emerald-500 font-bold transition hover:border-slate-600 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className="text-emerald-400" />
                    <span className="tracking-wide">{date.split('-').reverse().join('-')}</span>
                  </div>
                  <span className="text-slate-500 text-xs font-semibold bg-slate-800 px-3 py-1 rounded-lg">Change Date</span>
                </button>

                {/* CALENDAR DROPDOWN POPUP */}
                {isCalendarOpen && (
                  <>
                    {/* Backdrop to close calendar when clicked outside */}
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setIsCalendarOpen(false)} />
                    
                    <div className="absolute top-[110%] left-0 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
                      
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                        <span className="font-extrabold text-emerald-400 text-base">
                          {monthNames[viewMonth]} {viewYear}
                        </span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleMonthChange(-1)} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg transition"><ChevronLeft size={18} /></button>
                          <button type="button" onClick={() => handleMonthChange(1)} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg transition"><ChevronRight size={18} /></button>
                        </div>
                      </div>

                      {/* Weekdays */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <span key={d} className="text-[10px] font-bold text-slate-500 uppercase">{d}</span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1.5 text-center">
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`blank-${i}`} />)}

                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const formattedMonth = String(viewMonth + 1).padStart(2, '0');
                          const formattedDay = String(day).padStart(2, '0');
                          const thisDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

                          const isFuture = thisDateStr > todayStr;
                          const isPublished = publishedDatesList.includes(thisDateStr);
                          const isSelected = date === thisDateStr;

                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isFuture}
                              onClick={() => {
                                setDate(thisDateStr);
                                setIsCalendarOpen(false);
                                // Agar edit kar raha hai to seedha load karlo pages
                                if(isPublished) handleEditPaper(thisDateStr);
                                else setPages([{ pageNumber: 1, file: null, previewUrl: '' }]);
                              }}
                              className={`h-9 w-full text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200 
                                ${isSelected 
                                  ? 'bg-emerald-500 text-white shadow-lg scale-110 ring-2 ring-emerald-300/50 z-10' 
                                  : isFuture 
                                  ? 'text-slate-600 bg-slate-950/50 cursor-not-allowed' 
                                  : isPublished 
                                  ? 'bg-blue-900/60 border border-blue-500 text-blue-300 font-extrabold shadow-sm hover:scale-105 hover:bg-blue-800' 
                                  : 'text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-white'
                                }`}
                              title={isFuture ? 'Future Date' : isPublished ? 'Paper Already Published (BLUE)' : 'No Paper Published'}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Note for Admin */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <div className="w-3 h-3 rounded-full bg-blue-900/60 border border-blue-500"></div>
                        <span>Blue Dates = Already Published</span>
                      </div>

                    </div>
                  </>
                )}
              </div>
              {/* 🌟 CALENDAR END 🌟 */}

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3">Pages Image Files (JPG / PNG)</label>
                {pages.map((p, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-4 p-4 border border-slate-800 rounded-2xl bg-slate-950/60 items-center">
                    <span className="font-bold text-slate-400 w-20">Page {p.pageNumber}:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                      className="flex-1 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-white cursor-pointer hover:file:bg-emerald-700 transition"
                    />
                    {p.previewUrl && (
                      <img src={p.previewUrl} alt="Preview" className="w-16 h-20 object-cover rounded-lg border border-slate-700 shadow-md" />
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPageField} className="mt-2 text-sm font-bold text-emerald-400 hover:underline">
                  + Add Another Page
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl transition disabled:opacity-50"
              >
                {loading ? 'Processing & Syncing to Cloud...' : 'Publish Newspaper to Cloud'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ALL PAPERS DYNAMIC MONTHS CALENDAR */}
        {activeTab === 'all_papers' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Controls */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                <span>🗓️</span> All Months Publication Calendar
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-indigo-300 font-bold px-3 py-1.5 rounded-xl outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            {/* 12 Months Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthNames.map((monthName, monthIndex) => {
                const daysInM = new Date(selectedYear, monthIndex + 1, 0).getDate();
                const firstDayIdx = new Date(selectedYear, monthIndex, 1).getDay();

                return (
                  <div key={monthName} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition shadow-lg flex flex-col">
                    <h3 className="text-lg font-black text-indigo-300 mb-4 pb-2 border-b border-slate-800 text-center">
                      {monthName} {selectedYear}
                    </h3>
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 mb-2">
                      <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs flex-1">
                      {Array.from({ length: firstDayIdx }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                      {Array.from({ length: daysInM }).map((_, dayIdx) => {
                        const dayNum = dayIdx + 1;
                        const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                        const formattedMonth = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
                        const dateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

                        const isPublished = publishedDatesList.includes(dateStr);
                        const isFuture = dateStr > todayStr;

                        return (
                          <div
                            key={dateStr}
                            className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition relative ${
                              isPublished
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md font-extrabold cursor-pointer hover:scale-105'
                                : isFuture
                                ? 'bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed'
                                : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-600'
                            }`}
                            onClick={() => {
                              if (isPublished) {
                                handleEditPaper(dateStr);
                              } else if (!isFuture) {
                                setDate(dateStr);
                                setPages([{ pageNumber: 1, file: null, previewUrl: '' }]);
                                setActiveTab('upload');
                              }
                            }}
                          >
                            <span>{dayNum}</span>
                            {isPublished && (
                              <div className="flex gap-1 mt-1">
                                <button onClick={(e) => { e.stopPropagation(); handleEditPaper(dateStr); }} title="Edit Paper" className="text-[9px] bg-emerald-600 text-white px-1 rounded hover:bg-emerald-500">✏️</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePaper(dateStr); }} title="Delete Paper" className="text-[9px] bg-red-600 text-white px-1 rounded hover:bg-red-500">🗑️</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}