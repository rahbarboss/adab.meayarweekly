'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/data';
// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
// Standard worker setup for Next.js
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
  
  const [extractedPages, setExtractedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rahbar786' && password === 'rahbar@786') setIsLoggedIn(true);
  };

  // 1. PDF File Input Change & Auto-Extract
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
        const viewport = page.getViewport({ scale: 2.0 }); // High quality extract
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

  // 2. Publish to Supabase Storage & Database
  const handlePublish = async () => {
    if (extractedPages.length === 0) {
      alert("Please upload and extract a PDF first.");
      return;
    }

    setIsProcessing(true);
    setStatusMsg('Uploading images to Supabase Cloud...');

    try {
      const uploadedPages = [];
      
      // Upload each page image
      for (let i = 0; i < extractedPages.length; i++) {
        // Convert Base64 to Blob
        const res = await fetch(extractedPages[i]);
        const blob = await res.blob();
        
        const fileName = `${publishDate}_page_${i + 1}_${Date.now()}.jpg`;
        
        // Upload to Storage Bucket 'newspapers'
        const { data, error } = await supabase.storage
          .from('newspapers')
          .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (error) throw error;

        // Get Public URL
        const { data: urlData } = supabase.storage.from('newspapers').getPublicUrl(fileName);
        
        uploadedPages.push({
          pageNumber: i + 1,
          imageUrl: urlData.publicUrl
        });
      }

      setStatusMsg('Saving to Database...');

      // Save record in Database Table 'newspapers'
      const { error: dbError } = await supabase
        .from('newspapers')
        .upsert({ date: publishDate, pages: uploadedPages }, { onConflict: 'date' });

      if (dbError) throw dbError;

      setStatusMsg('Newspaper Published Successfully!');
      alert('Newspaper Published Successfully!');
      setExtractedPages([]); // Reset after publish
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
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
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

            <div style={{ marginBottom: '20px' }}>
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

            {/* Status & Preview */}
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
          /* ALL PAPERS (Calendar) */
          <div style={{ width: '100%', maxWidth: '1080px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#6366f1', marginBottom: '20px' }}>📅 Publication Calendar Overview</h2>
             <p style={{ color: '#94a3b8' }}>Check frontend website to view the published editions.</p>
          </div>
        )}
      </main>
    </div>
  );
}