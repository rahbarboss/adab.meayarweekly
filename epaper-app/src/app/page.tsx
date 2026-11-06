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
      setTimeout(() => setIsLoading(false), 1200);
    }
    loadPaper();
  }, [currentDate]);

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
  };

  const activeImage = pages.find((p) => p.pageNo === currentPage)?.image || pages[0]?.image;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top-nav">
        <div className="nav-center-group">
          
          {/* Dynamic Date Selector */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', zIndex: 10
              }}
            />
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
              <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.min(p + 0.25, 2.5))}>+</button>
              <button className="zoom-btn" onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.75))}>-</button>
              <button className="zoom-btn" onClick={() => setZoomLevel(1)}>↺</button>
            </div>
          )}
        </main>
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