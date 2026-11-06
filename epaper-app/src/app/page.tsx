'use client';

import React, { useState } from 'react';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);

  // Default pages (Fikr-o-Khayal)
  const pages = [
    { pageNo: 1, image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1400&q=85' },
    { pageNo: 2, image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=85' },
  ];

  const handleShare = (type: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (type === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'gmail') {
      window.open(`mailto:?subject=Read Fikr-o-Khayal Weekly&body=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
    setShowShare(false);
  };

  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || pages[0].image;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Controls (Image 1 replica) */}
      <header className="top-nav">
        <button className="date-btn">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>20-09-2026</span>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </button>

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
              <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
              <button onClick={() => handleShare('gmail')}>Gmail</button>
              <button onClick={() => handleShare('copy')}>Copy Link</button>
            </div>
          )}
        </div>

        {/* Page Switcher Pill */}
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
      </header>

      {/* Main View: Left Thumbnails + Center Viewer (Image 1 replica) */}
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
          <img src={activeImage} alt={`Page ${currentPage}`} className="paper-display" />
        </main>
      </div>
    </div>
  );
}