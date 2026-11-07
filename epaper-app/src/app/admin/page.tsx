'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/data';

// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'calendar'>('upload');
  
  const [publishDate, setPublishDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [badgeText, setBadgeText] = useState(''); // NEW STATE FOR BADGE
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const [publishedDates, setPublishedDates] = useState<string[]>([]);
  const [viewsData, setViewsData] = useState<Record<string, number>>({});
  
  const [selectedYear, setSelectedYear] = useState(2026);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin@123' || username === 'rahbar786' && password === 'rahbar@786') setIsLoggedIn(true);
  };

  useEffect(() => {
    async function fetchPublishedDates() {
      if (activeTab === 'calendar' && isLoggedIn) {
        try {
          const { data: files } = await supabase.storage.from('newspapers').list('', { limit: 1000 });
          if (files) {
            const dates = files.filter(f => f.name.includes('_page_')).map(f => f.name.substring(0, 10));
            setPublishedDates(Array.from(new Set(dates)));
          }

          const { data: dbData } = await supabase.from('newspapers').select('date, views');
          if (dbData) {
            const vData: Record<string, number> = {};
            dbData.forEach(item => {
              vData[item.date] = item.views || 0;
            });
            setViewsData(vData);
          }
        } catch (err) {
          console.error("Error fetching dates & views:", err);
        }
      }
    }
    fetchPublishedDates();
  }, [activeTab, isLoggedIn]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMsg('Extracting pages from PDF...');
    setExtractedPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      const newPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          newPages.push(canvas.toDataURL('image/jpeg', 0.9));
        }
      }
      
      setExtractedPages(newPages);
      setStatusMsg(`Successfully extracted ${newPages.length} pages.`);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error extracting PDF. Make sure it is a valid PDF file.');
    }
    setIsProcessing(false);
  };

  const handlePublish = async () => {
    if (extractedPages.length === 0) return;
    setIsProcessing(true);
    setStatusMsg('Uploading images to Supabase Cloud...');

    try {
      for (let i = 0; i < extractedPages.length; i++) {
        const res = await fetch(extractedPages[i]);
        const blob = await res.blob();
        const fileName = `${publishDate}_page_${i + 1}_${Date.now()}.jpg`;
        
        const { error } = await supabase.storage
          .from('newspapers')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
        if (error) throw error;
      }
      
      // UPSERT DATE WITH BADGE TEXT
      await supabase.from('newspapers').upsert({ 
        date: publishDate,
        badge_text: badgeText.trim() 
      }, { onConflict: 'date' });

      setStatusMsg('Newspaper Published Successfully!');
      alert('Newspaper Published Successfully!');
      setExtractedPages([]);
      setBadgeText(''); // Clear input after publish
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Upload Failed: ${err.message}`);
    }
    setIsProcessing(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#040914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Admin Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Enter credentials to manage E-Paper</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', background: '#040914', color: '#fff', fontSize: '14px' }} required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', background: '#040914', color: '#fff', fontSize: '14px' }} required />
            <button type="submit" style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: '#040914', color: '#ffffff', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>E-Paper Admin Panel</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('upload')} style={{ background: activeTab === 'upload' ? '#10b981' : '#1e293b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ Upload Paper</button>
          <button onClick={() => setActiveTab('calendar')} style={{ background: activeTab === 'calendar' ? '#6366f1' : '#1e293b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📅 ALL PAPERS</button>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ padding: '36px', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'upload' ? (
          <div style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '680px', alignSelf: 'flex-start' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '20px' }}>📑 Upload E-Paper Edition</h2>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Publish Date</label>
                <div style={{ background: '#040914', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 16px', position: 'relative' }}>
                  <input 
                    type="date" 
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', zIndex: 10, position: 'relative' }}
                  />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Special Edition Title (Optional)</label>
                <div style={{ background: '#040914', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 16px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. Eid Special"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '15px', fontWeight: 'bold', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ border: '2px dashed #0d9488', borderRadius: '14px', padding: '36px 20px', textAlign: 'center', background: 'rgba(13, 148, 136, 0.03)', marginBottom: '24px', position: 'relative' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Upload Full PDF Document</h3>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>Upload a single PDF to auto-extract pages.</p>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isProcessing}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                />
                <button type="button" style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', pointerEvents: 'none' }}>
                  {isProcessing ? 'Processing...' : '📑 Select PDF File'}
                </button>
              </div>
            </div>

            {statusMsg && (
              <div style={{ marginBottom: '20px', padding: '12px', background: '#1e293b', borderRadius: '8px', color: '#a7f3d0', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
                {statusMsg}
              </div>
            )}
            
            {extractedPages.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
                {extractedPages.map((img, i) => (
                  <div key={i} style={{ minWidth: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
                    <img src={img} alt={`Pg ${i+1}`} style={{ width: '100%', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}

            <button 
              type="button" 
              onClick={handlePublish}
              disabled={isProcessing || extractedPages.length === 0}
              style={{ width: '100%', background: (isProcessing || extractedPages.length === 0) ? '#334155' : '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: (isProcessing || extractedPages.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              🚀 Publish Newspaper
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            <div style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800' }}>📅 Publication Calendar & Analytics</span>
              
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ background: '#1e293b', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                {[2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, mIndex) => {
                const year = selectedYear;
                const daysInMonth = new Date(year, mIndex + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, mIndex, 1).getDay();
                
                return (
                  <div key={month} style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', marginBottom: '12px' }}>{month} {year}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px' }}>
                      {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => <div key={d} style={{ color: '#475569', fontWeight: 'bold' }}>{d}</div>)}
                      
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`}></div>
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                        const day = dIdx + 1;
                        const dateStr = `${year}-${String(mIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isPublished = publishedDates.includes(dateStr);
                        const views = viewsData[dateStr] || 0;
                        
                        return (
                          <div 
                            key={day} 
                            style={{ 
                              padding: isPublished ? '4px 0' : '8px 0', 
                              borderRadius: '6px', 
                              background: isPublished ? '#064e3b' : 'transparent', 
                              color: isPublished ? '#a7f3d0' : '#94a3b8',
                              border: isPublished ? '1px solid #10b981' : '1px solid transparent',
                              fontWeight: isPublished ? 'bold' : 'normal',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <div>{day}</div>
                            {isPublished && (
                              <div style={{ fontSize: '9px', marginTop: '2px', color: '#6ee7b7' }}>👁️ {views}</div>
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
      </main>
    </div>
  );
}