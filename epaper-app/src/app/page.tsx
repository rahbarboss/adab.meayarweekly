'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [currentDate, setCurrentDate] = useState('2026-09-20');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [pages, setPages] = useState<Array<{ pageNo: number; image: string }>>([
    { pageNo: 1, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=2400&q=95' },
    { pageNo: 2, image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=2400&q=95' },
  ]);

  useEffect(() => {
    async function loadPaper() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('newspapers')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.pages) {
          setCurrentDate(data.date);
          const mapped = data.pages.map((p: any, idx: number) => ({
            pageNo: p.pageNumber || idx + 1,
            image: p.imageUrl,
          }));
          setPages(mapped);
        }
      } catch (err) {}
      
      // Simulate rendering time for the icon to show
      setTimeout(() => setIsLoading(false), 1200);
    }
    loadPaper();
  }, []);

  const handleShare = (type: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'download') {
      // Simulate PDF download logic
      alert('Generating PDF for Download...');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link Copied!');
    }
  };

  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || pages[0]?.image;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header className="top-nav">
        <div className="nav-center-group">
          {/* Real Date Picker */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer'
              }}
            />
            <button className="date-btn" style={{ pointerEvents: 'none' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{currentDate}</span>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </button>
          </div>

          <button className="share-btn" onClick={() => setShowShare(true)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
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
            <button className="nav-arrow" onClick={() => setCurrentPage(p => Math.min(p + 1, pages.length))}>&gt;</button>
          </div>
        </div>
      </header>

      <div className="main-viewport">
        <aside className="left-sidebar">
          {pages.map((p) => (
            <div
              key={p.pageNo}
              className={`thumb-wrapper ${currentPage === p.pageNo ? 'active' : ''}`}
              onClick={() => setCurrentPage(p.pageNo)}
            >
              <img src={p.image} alt={`Page ${p.pageNo}`} />
              <div className="thumb-text">Page No {p.pageNo}</div>
            </div>
          ))}
        </aside>

        <main className="viewer-area">
          {isLoading ? (
            /* Document Loader Icon */
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
          ) : (
            <div className="paper-container" style={{ transform: `scale(${zoomLevel})` }}>
              <img src={activeImage} alt={`Page ${currentPage}`} className="paper-display" />
            </div>
          )}
          
          {!isLoading && (
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.min(p + 0.25, 2.5))}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.75))}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button className="zoom-btn" onClick={() => setZoomLevel(1)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Share Modal Pop-up (Image 4 Style) */}
      {showShare && (
        <div className="share-modal-overlay" onClick={() => setShowShare(false)}>
          <div className="share-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="share-modal-close" onClick={() => setShowShare(false)}>✕</button>
            
            <div className="share-modal-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            
            <h2 className="share-modal-title">Share E-Paper</h2>
            <div className="share-modal-date">{currentDate} Edition</div>

            <div className="share-btn-row">
              <button className="share-circle-btn" onClick={() => handleShare('whatsapp')}>
                <div className="icon-bg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#22c55e">
                    <path d="M12.031 21.037l-3.328 1.758 1.4-3.553a9.92 9.92 0 01-1.39-5.111c0-5.465 4.475-9.941 9.941-9.941s9.941 4.476 9.941 9.941-4.476 9.941-9.941 9.941a9.919 9.919 0 01-5.163-1.442l-1.46.747z" />
                  </svg>
                </div>
                <span>WhatsApp</span>
              </button>

              <button className="share-circle-btn" onClick={() => handleShare('facebook')}>
                <div className="icon-bg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </div>
                <span>Facebook</span>
              </button>

              {/* Download PDF replaces Twitter */}
              <button className="share-circle-btn" onClick={() => handleShare('download')}>
                <div className="icon-bg">
                  <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M12 18v-6"></path>
                    <path d="M9 15l3 3 3-3"></path>
                  </svg>
                </div>
                <span>PDF Download</span>
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