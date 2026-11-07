'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [pages, setPages] = useState<Array<{ pageNo: number; image: string }>>([]);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // VIEW TRACKER
  const viewedDates = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPapersFromStorage() {
      setIsLoading(true);
      try {
        const { data: files, error } = await supabase.storage.from('newspapers').list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'desc' }
        });

        if (files && files.length > 0) {
          const validFiles = files.filter(f => f.name.includes('_page_'));

          if (validFiles.length > 0) {
            const dates = validFiles.map(f => f.name.substring(0, 10)); 
            const uniqueDates = Array.from(new Set(dates)).sort().reverse();
            setAvailableDates(uniqueDates);

            let targetDate = currentDate;
            if (!targetDate) {
              targetDate = uniqueDates[0];
              setCurrentDate(targetDate);
              setCalendarMonth(new Date(targetDate));
            }

            const dateFiles = validFiles.filter(f => f.name.startsWith(targetDate));

            if (dateFiles.length > 0) {
              const mappedPages = dateFiles.map(f => {
                const pageMatch = f.name.match(/_page_(\d+)/);
                const pageNo = pageMatch ? parseInt(pageMatch[1], 10) : 1;
                const { data: publicUrlData } = supabase.storage.from('newspapers').getPublicUrl(f.name);
                return { pageNo, image: publicUrlData.publicUrl };
              });
              mappedPages.sort((a, b) => a.pageNo - b.pageNo);
              setPages(mappedPages);
              setCurrentPage(1);

              // UPDATE VIEWS
              if (!viewedDates.current.has(targetDate)) {
                viewedDates.current.add(targetDate);
                const { data: dbData } = await supabase
                  .from('newspapers')
                  .select('views')
                  .eq('date', targetDate)
                  .maybeSingle();
                
                const currentViews = dbData?.views || 0;
                await supabase
                  .from('newspapers')
                  .update({ views: currentViews + 1 })
                  .eq('date', targetDate);
              }
            } else {
              setPages([]);
            }
          }
        }
      } catch (err) {
        console.error("Storage fetch error:", err);
      }
      setTimeout(() => setIsLoading(false), 800);
    }
    fetchPapersFromStorage();
  }, [currentDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (type: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
      setShowShare(false);
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      setShowShare(false);
    } else if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link Copied!');
      setShowShare(false);
    } else if (type === 'download') {
      // ==========================================
      // ASLI PDF DOWNLOAD LOGIC
      // ==========================================
      const downloadPDF = async () => {
        alert('PDF Download start ho gaya hai. Kripya thoda intezaar karein...');
        try {
          const { jsPDF } = await import('jspdf');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            
            // Supabase se image blob format me fetch karna taaki CORS error na aaye
            const response = await fetch(pages[i].image);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            pdf.addImage(base64, 'JPEG', 0, 0, pageWidth, pageHeight);
          }
          pdf.save(`Fikr_o_Khayal_${currentDate}.pdf`);
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('PDF Generate karne me error aayi. Please refresh karke try karein.');
        }
      };
      
      downloadPDF();
      setShowShare(false); // Modal band kar dein
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day" style={{ background: 'transparent', border: 'none' }}></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = dateStr === currentDate;

      days.push(
        <div 
          key={dateStr}
          className="cal-day"
          onClick={() => {
            if (isAvailable) {
              setCurrentDate(dateStr);
              setShowCalendar(false);
            }
          }}
          style={{
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            background: isSelected ? '#0d9488' : (isAvailable ? '#f1f5f9' : '#f8fafc'),
            color: isSelected ? 'white' : (isAvailable ? '#0f172a' : '#cbd5e1'),
            fontWeight: isAvailable ? 'bold' : 'normal',
            border: isAvailable && !isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
          }}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || '';

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      
      <header className="top-nav">
        <div className="nav-center-group">
          
          <div style={{ position: 'relative', display: 'inline-flex' }} ref={calendarRef}>
            <button className="date-btn" onClick={() => setShowCalendar(!showCalendar)} style={{ position: 'relative', zIndex: 1 }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{currentDate || 'Loading...'}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            
            {showCalendar && (
              <div className="calendar-dropdown">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#0d9488', padding: '8px', borderRadius: '6px', color: 'white' }}>
                  <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>&lt;</button>
                  <span style={{ fontWeight: 'bold' }}>{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</span>
                  <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>&gt;</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
                  <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                  {renderCalendar()}
                </div>
              </div>
            )}
          </div>

          <button className="share-btn" onClick={() => setShowShare(true)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>

          <div className="page-pill-container">
            <button className="nav-arrow" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&lt;</button>
            {pages.map((p) => (
              <button
                key={p.pageNo}
                className={`page-num-circle ${currentPage === p.pageNo ? 'active' : ''}`}
                onClick={() => setCurrentPage(p.pageNo)}
              >
                {p.pageNo}
              </button>
            ))}
            <button className="nav-arrow" onClick={() => setCurrentPage(p => Math.min(p + 1, pages.length || 1))}>&gt;</button>
          </div>
        </div>
      </header>

      <div className="main-viewport">
        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080f1d' }}>
            <div className="document-loader">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div style={{ marginTop: '16px', fontWeight: '600' }}>Loading Paper...</div>
            </div>
          </div>
        ) : pages.length > 0 ? (
          <>
            <aside className="left-sidebar">
              {pages.map((p) => (
                <div key={p.pageNo} className={`thumb-wrapper ${currentPage === p.pageNo ? 'active' : ''}`} onClick={() => setCurrentPage(p.pageNo)}>
                  <img src={p.image} alt={`Page ${p.pageNo}`} />
                  <div className="thumb-text">Page No {p.pageNo}</div>
                </div>
              ))}
            </aside>
            <main className="viewer-area">
              <div className="paper-container" style={{ transform: `scale(${zoomLevel})` }}>
                <img src={activeImage} className="paper-display" alt="Newspaper Page" />
              </div>
              
              <div className="zoom-controls">
                <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.min(p + 0.25, 2.5))}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.75))}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button className="zoom-btn" onClick={() => setZoomLevel(1)}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>
                  </svg>
                </button>
              </div>
            </main>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#64748b', background: '#080f1d' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>No Papers Found</h2>
          </div>
        )}
      </div>

      {showShare && (
        <div className="share-modal-overlay" onClick={() => setShowShare(false)}>
          <div className="share-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="share-modal-close" onClick={() => setShowShare(false)}>✕</button>
            <div className="share-modal-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Share E-Paper</h2>
            <div style={{ background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800', display: 'inline-block' }}>
              {currentDate} Edition
            </div>
            <div className="share-btn-row">
              <button className="share-circle-btn" onClick={() => handleShare('whatsapp')}>
                <div className="icon-bg"><span style={{fontSize: '24px'}}>🟢</span></div><span>WhatsApp</span>
              </button>
              <button className="share-circle-btn" onClick={() => handleShare('facebook')}>
                <div className="icon-bg"><span style={{fontSize: '24px'}}>🔵</span></div><span>Facebook</span>
              </button>
              <button className="share-circle-btn" onClick={() => handleShare('download')}>
                <div className="icon-bg"><span style={{fontSize: '24px'}}>📥</span></div><span>PDF</span>
              </button>
            </div>
            <div className="copy-link-box">
              <input type="text" readOnly value="https://fikr-o-khayalweekly.vercel.app" />
              <button onClick={() => handleShare('copy')}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}