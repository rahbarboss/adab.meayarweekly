'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/data';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [currentDate, setCurrentDate] = useState('20-09-2026');

  // Initial pages state matching exact Fikr-o-Khayal edition
  const [pages, setPages] = useState<Array<{ pageNo: number; image: string }>>([
    {
      pageNo: 1,
      image: '/papers/2026/09/20/page_1.jpg',
    },
    {
      pageNo: 2,
      image: '/papers/2026/09/20/page_2.jpg',
    },
  ]);

  // Fetch admin uploaded pages from Supabase if available
  useEffect(() => {
    async function loadPublishedPaper() {
      try {
        const { data, error } = await supabase
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
      {/* Top Header Pill Bar (Image 2 style) */}
      <header className="top-nav">
        <button className="date-btn">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

        <div style={{ position: 'relative' }}>
          <button className="share-btn" onClick={() => setShowShare(!showShare)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

      {/* Main View: Left Thumbnails + Center Newspaper Viewer */}
      <div className="main-viewport">
        <aside className="left-sidebar">
          {pages.map((p) => (
            <div
              key={p.pageNo}
              className={`thumb-wrapper ${currentPage === p.pageNo ? 'active' : ''}`}
              onClick={() => setCurrentPage(p.pageNo)}
            >
              <img 
                src={p.image} 
                alt={`Page ${p.pageNo}`} 
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                }}
              />
              <div className="thumb-text">Page No {p.pageNo}</div>
            </div>
          ))}
        </aside>

        <main className="viewer-area">
          <div className="paper-container">
            <img 
              src={activeImage} 
              alt={`Page ${currentPage}`} 
              className="paper-display"
              onError={(e: any) => {
                e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&q=90';
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}