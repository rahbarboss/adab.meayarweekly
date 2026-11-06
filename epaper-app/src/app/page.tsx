'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [pages, setPages] = useState<Array<{ pageNo: number; image: string }>>([]);

  // Fetch all available dates from Supabase on load
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        // Sirf wahi dates fetch karo jo database me hain
        const { data: dateData } = await supabase
          .from('newspapers')
          .select('date')
          .order('date', { ascending: false });

        if (dateData && dateData.length > 0) {
          const uniqueDates = Array.from(new Set(dateData.map(d => d.date)));
          setAvailableDates(uniqueDates);
          
          const latestDate = uniqueDates[0];
          setCurrentDate(latestDate);
          
          // Latest date ka paper fetch karo
          const { data: paperData } = await supabase
            .from('newspapers')
            .select('*')
            .eq('date', latestDate)
            .maybeSingle();

          if (paperData && paperData.pages) {
            const mapped = paperData.pages.map((p: any, idx: number) => ({
              pageNo: p.pageNumber || idx + 1,
              image: p.imageUrl,
            }));
            setPages(mapped);
          }
        }
      } catch (err) {}
      setTimeout(() => setIsLoading(false), 800);
    }
    loadInitialData();
  }, []);

  // Jab user Date change kare (Dropdown se)
  const handleDateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value;
    setCurrentDate(selectedDate);
    setIsLoading(true);
    
    try {
      const { data } = await supabase
        .from('newspapers')
        .select('*')
        .eq('date', selectedDate)
        .maybeSingle();

      if (data && data.pages) {
        const mapped = data.pages.map((p: any, idx: number) => ({
          pageNo: p.pageNumber || idx + 1,
          image: p.imageUrl,
        }));
        setPages(mapped);
        setCurrentPage(1);
      } else {
        setPages([]); 
      }
    } catch (err) {}
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleShare = (type: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'download') {
      alert('Generating PDF for Download...');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link Copied!');
    }
    setShowShare(false);
  };

  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || '';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="top-nav">
        <div className="nav-center-group">
          
          {/* Dynamic Dropdown showing ONLY uploaded dates */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button className="date-btn" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{currentDate || 'No Papers'}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
            <select 
              value={currentDate}
              onChange={handleDateChange}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', zIndex: 10
              }}
            >
              {availableDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
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

      {/* Main Viewport */}
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

      {/* Share Modal */}
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