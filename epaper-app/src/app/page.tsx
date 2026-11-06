'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [currentDate, setCurrentDate] = useState('20-09-2026');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Original Fikr-o-Khayal Pages with Ultra HD rendering
  const [pages, setPages] = useState<Array<{ pageNo: number; image: string }>>([
    {
      pageNo: 1,
      image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=2400&q=95&auto=format&fit=crop',
    },
    {
      pageNo: 2,
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=2400&q=95&auto=format&fit=crop',
    },
  ]);

  // Load Admin Published Edition from Database
  useEffect(() => {
    async function loadPublishedPaper() {
      try {
        const { data } = await supabase
          .from('newspapers')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.pages && data.pages.length > 0) {
          setCurrentDate(data.date);
          const mapped = data.pages.map((p: any, idx: number) => ({
            pageNo: p.pageNumber || idx + 1,
            image: p.imageUrl,
          }));
          setPages(mapped);
        }
      } catch (err) {
        // Fallback remains active
      }
    }
    loadPublishedPaper();
  }, []);

  const handleShare = (type: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'gmail') {
      window.open(`mailto:?subject=Read Fikr-o-Khayal Weekly&body=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
    setShowShare(false);
  };

  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || pages[0]?.image;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header - Center Aligned exactly over newspaper */}
      <header className="top-nav">
        <div className="nav-center-group">
          {/* Date Pill */}
          <button className="date-btn">
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

          {/* Share Pill with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button className="share-btn" onClick={() => setShowShare(!showShare)}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share</span>
            </button>

            {showShare && (
              <div className="share-menu">
                <button onClick={() => handleShare('whatsapp')}>🟢 WhatsApp</button>
                <button onClick={() => handleShare('gmail')}>✉️ Gmail</button>
                <button onClick={() => handleShare('copy')}>🔗 Copy Link</button>
              </div>
            )}
          </div>

          {/* Page Pill */}
          <div className="page-pill-container">
            <button 
              className="nav-arrow" 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              &lt;
            </button>
            
            {pages.map((p) => (
              <button
                key={p.pageNo}
                className={`page-num-circle ${currentPage === p.pageNo ? 'active' : ''}`}
                onClick={() => setCurrentPage(p.pageNo)}
              >
                {p.pageNo}
              </button>
            ))}

            <button 
              className="nav-arrow" 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages.length))}
            >
              &gt;
            </button>
          </div>
        </div>
      </header>

      {/* Main View */}
      <div className="main-viewport">
        {/* Left Thumbnails */}
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

        {/* Center Viewer */}
        <main className="viewer-area">
          <div 
            className="paper-container" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img 
              src={activeImage} 
              alt={`Page ${currentPage}`} 
              className="paper-display"
            />
          </div>

          {/* Floating Zoom Controls (Zoom In, Zoom Out, Reset) */}
          <div className="zoom-controls">
            <button 
              className="zoom-btn" 
              title="Zoom In" 
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <button 
              className="zoom-btn" 
              title="Zoom Out" 
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <button 
              className="zoom-btn" 
              title="Reset Zoom" 
              onClick={() => setZoomLevel(1)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}