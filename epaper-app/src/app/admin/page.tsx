'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, ArrowLeft, Upload, Lock, User, CheckCircle, FileImage, Calendar as CalendarIcon, Folder, Newspaper as PaperIcon, Eye, EyeOff, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { savePaperToDB, getAllPapersFromDB, deletePaperFromDB, Newspaper } from '@/lib/data';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active Menu Tab: 'upload' or 'all_papers'
  const [activeTab, setActiveTab] = useState<'upload' | 'all_papers'>('all_papers');

  // Form State
  const [paperDate, setPaperDate] = useState('2026-07-21');
  const [pages, setPages] = useState<string[]>(['']);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Animated Calendar Modal State for Admin
  const [isAdminCalendarOpen, setIsAdminCalendarOpen] = useState(false);
  const currentDateObj = new Date(paperDate);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth() || 6);

  // All Papers List & Selected Paper Details Modal
  const [allPapersList, setAllPapersList] = useState<Newspaper[]>([]);
  const [selectedPaperModal, setSelectedPaperModal] = useState<Newspaper | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllPapers();
    }
  }, [isLoggedIn, activeTab]);

  const loadAllPapers = async () => {
    const papers = await getAllPapersFromDB();
    setAllPapersList(papers);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rahbar786' && password === 'rahbar@786') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid Admin Credentials!');
    }
  };

  const addPageInput = () => {
    setPages([...pages, '']);
  };

  const handleFileUpload = (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const updatedPages = [...pages];
      updatedPages[index] = result;
      setPages(updatedPages);
    };
    reader.readAsDataURL(file);
  };

  const removePageInput = (index: number) => {
    if (pages.length === 1) {
      alert("Kam se kam 1 page zaroori hai!");
      return;
    }
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
  };

  // Save / Update Paper
  const handleSavePaper = async () => {
    const validPages = pages.filter(p => p.trim() !== '');
    if (validPages.length === 0) {
      alert("Kripya kam se kam ek page upload karein!");
      return;
    }

    setLoading(true);

    const formattedPages = validPages.map((url, idx) => ({
      pageNumber: idx + 1,
      imageUrl: url
    }));

    const paperData = {
      date: paperDate,
      pages: formattedPages
    };

    try {
      await savePaperToDB(paperData);
      setSuccessMsg('Newspaper Successfully Published / Updated!');
      loadAllPapers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
      alert('Error saving paper!');
    } finally {
      setLoading(false);
    }
  };

  // Edit Selected Paper
  const handleEditPaper = (paper: Newspaper) => {
    setPaperDate(paper.date);
    setPages(paper.pages.map(p => p.imageUrl));
    setSelectedPaperModal(null);
    setActiveTab('upload');
  };

  // Delete Selected Paper
  const handleDeletePaper = async (date: string) => {
    if (confirm(`${date} ka newspaper delete karna chahte hain?`)) {
      await deletePaperFromDB(date);
      setSuccessMsg(`${date} Paper successfully deleted!`);
      setSelectedPaperModal(null);
      loadAllPapers();
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Calendar Helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectAdminDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const newDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    setPaperDate(newDateStr);
    setIsAdminCalendarOpen(false);
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

  // Group papers by Month
  const getGroupedPapersByMonth = () => {
    const grouped: { [key: string]: Newspaper[] } = {};

    allPapersList.forEach(paper => {
      const dateObj = new Date(paper.date);
      const monthYear = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(paper);
    });

    return grouped;
  };

  const groupedPapers = getGroupedPapersByMonth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <form 
          onSubmit={handleLogin} 
          className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full"
          autoComplete="off"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Admin Login</h2>
          
          <div className="mb-4 relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2.5 pl-10 rounded-lg outline-none focus:border-emerald-600 font-medium text-slate-800"
              autoComplete="new-username"
              required
            />
          </div>

          <div className="mb-6 relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2.5 pl-10 pr-10 rounded-lg outline-none focus:border-emerald-600 font-medium text-slate-800"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-lg font-semibold transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-black font-medium">
            <ArrowLeft size={20} /> Back to Front Page
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Admin Control Panel</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-300 pb-2">
          <button 
            onClick={() => setActiveTab('all_papers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition shadow-sm ${
              activeTab === 'all_papers' 
                ? 'bg-emerald-800 text-white shadow' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Folder size={18} /> ALL PAPERS ({allPapersList.length})
          </button>

          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition shadow-sm ${
              activeTab === 'upload' 
                ? 'bg-emerald-800 text-white shadow' 
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload size={18} /> + Add / Upload Newspaper
          </button>
        </div>

        {/* Alert Notification */}
        {successMsg && (
          <div className="mb-4 bg-emerald-100 border border-emerald-400 text-emerald-800 p-3 rounded-lg flex items-center gap-2 font-semibold animate-pulse">
            <CheckCircle size={20} />
            {successMsg}
          </div>
        )}

        {/* TAB 1: ALL PAPERS */}
        {activeTab === 'all_papers' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-8">
            {Object.keys(groupedPapers).length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 rounded-xl border-2 border-dashed">
                Abhi koi newspaper upload nahi hua hai. Naya paper upload karne ke liye <b>"+ Add / Upload Newspaper"</b> tab par click karein.
              </div>
            ) : (
              Object.entries(groupedPapers).map(([monthYear, papers]) => (
                <div key={monthYear} className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-lg uppercase tracking-wide border-b pb-2">
                    <CalendarIcon size={20} className="text-slate-500" />
                    <span>{monthYear}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {papers.map((paper) => {
                      const dayNumber = new Date(paper.date).getDate();
                      return (
                        <button
                          key={paper.date}
                          onClick={() => setSelectedPaperModal(paper)}
                          className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
                          title={`View / Edit Newspaper for ${paper.date}`}
                        >
                          {dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD / EDIT FORM */}
        {activeTab === 'upload' && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-emerald-800 border-b pb-2 flex items-center gap-2">
              <PaperIcon size={20} /> Upload / Edit Newspaper Pages
            </h2>
            
            {/* CUSTOM ANIMATED ADMIN DATE PICKER BUTTON */}
            <div className="mb-6 relative">
              <label className="block text-sm font-semibold mb-1 text-slate-700">Select Paper Date:</label>
              
              <button 
                type="button"
                onClick={() => setIsAdminCalendarOpen(!isAdminCalendarOpen)}
                className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold px-5 py-2.5 rounded-full flex items-center justify-between gap-3 text-sm shadow-md hover:shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-emerald-700 w-full sm:w-64"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="animate-pulse text-emerald-300" />
                  <span>{paperDate.split('-').reverse().join('-')}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isAdminCalendarOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ADMIN CUSTOM ANIMATED CALENDAR POPUP */}
              {isAdminCalendarOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/10" 
                    onClick={() => setIsAdminCalendarOpen(false)} 
                  />

                  <div className="absolute left-0 mt-2 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <span className="font-extrabold text-slate-800 text-base">
                        {monthNames[viewMonth]} {viewYear}
                      </span>

                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={() => handleMonthChange(-1)} 
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleMonthChange(1)} 
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <span key={d} className="text-xs font-bold text-slate-400">{d}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`blank-${i}`} />
                      ))}

                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const formattedMonth = String(viewMonth + 1).padStart(2, '0');
                        const formattedDay = String(day).padStart(2, '0');
                        const thisDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
                        const isSelected = paperDate === thisDateStr;

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleSelectAdminDay(day)}
                            className={`h-9 w-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-md scale-105 ring-2 ring-emerald-300'
                                : 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:scale-105'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-2 border-t flex items-center justify-between text-xs font-bold">
                      <button 
                        type="button"
                        onClick={() => {
                          setPaperDate('2026-07-21');
                          setIsAdminCalendarOpen(false);
                        }} 
                        className="text-emerald-700 hover:underline"
                      >
                        Today (21 July)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAdminCalendarOpen(false)} 
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-semibold">Choose Paper Images (JPG, PNG, WEBP):</label>
              
              {pages.map((pageUrl, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700 text-sm bg-slate-200 px-3 py-1 rounded">Page {idx + 1}</span>
                    <FileImage className="text-slate-400" size={24} />
                  </div>

                  <div className="flex-1 w-full">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(idx, e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>

                  {pageUrl && (
                    <div className="w-12 h-16 bg-white border rounded overflow-hidden flex items-center justify-center shadow-sm">
                      <img src={pageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={() => removePageInput(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remove Page"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <button 
                type="button"
                onClick={addPageInput}
                className="w-full py-2.5 border-2 border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Plus size={18} /> + Add page
              </button>
            </div>

            <button 
              type="button"
              disabled={loading}
              onClick={handleSavePaper} 
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow disabled:opacity-50 transition"
            >
              <Upload size={18} /> {loading ? 'Publishing...' : 'Save & Publish Newspaper'}
            </button>
          </div>
        )}

      </div>

      {/* Modal Popup */}
      {selectedPaperModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-slate-200">
            <button 
              type="button"
              onClick={() => setSelectedPaperModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black transition"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-bold mb-2 text-slate-800 flex items-center gap-2">
              <PaperIcon className="text-emerald-700" size={22} />
              Newspaper Details
            </h3>

            <p className="text-sm font-semibold text-slate-500 mb-4">
              Date: <span className="text-slate-800 font-bold">{selectedPaperModal.date}</span>
            </p>

            <div className="bg-slate-100 rounded-lg p-3 mb-6 flex items-center gap-3">
              <div className="w-16 h-20 bg-white border rounded overflow-hidden shadow-sm">
                <img src={selectedPaperModal.pages[0]?.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{selectedPaperModal.pages.length} Pages</p>
                <p className="text-xs text-slate-500">Live on Front-Page</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => handleEditPaper(selectedPaperModal)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                <Edit3 size={18} /> Edit Paper
              </button>

              <button 
                type="button"
                onClick={() => handleDeletePaper(selectedPaperModal.date)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                <Trash2 size={18} /> Delete Paper
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}