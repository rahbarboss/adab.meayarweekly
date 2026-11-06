'use client';
import React, { useState } from 'react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'calendar'>('upload');
  
  const [publishDate, setPublishDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rahbar786' && password === 'rahbar@786') setIsLoggedIn(true);
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
            <button type="submit" style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>Login</button>
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
          <p style={{ color: '#64748b', fontSize: '12px' }}>Manage publications & Cloud Storage</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('upload')} style={{ background: activeTab === 'upload' ? '#10b981' : '#1e293b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ Upload Paper</button>
          <button onClick={() => setActiveTab('calendar')} style={{ background: activeTab === 'calendar' ? '#6366f1' : '#1e293b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>📅 ALL PAPERS</button>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* Main Area Scroll Fix */}
      <main style={{ padding: '36px', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'upload' ? (
          <div style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '680px', alignSelf: 'flex-start' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '20px' }}>📑 Upload E-Paper Edition</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Publish Date</label>
              
              {/* Working Date Picker */}
              <div style={{ background: '#040914', border: '1px solid #1e293b', borderRadius: '10px', padding: '10px 16px', position: 'relative' }}>
                <input 
                  type="date" 
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', zIndex: 10, position: 'relative' }}
                />
              </div>
            </div>

            {/* Fixed Upload Click Area */}
            <div style={{ border: '2px dashed #0d9488', borderRadius: '14px', padding: '36px 20px', textAlign: 'center', background: 'rgba(13, 148, 136, 0.03)', marginBottom: '24px', position: 'relative' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Upload Full PDF Document</h3>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>Upload a single PDF to auto-extract pages.</p>
              
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                />
                <button type="button" style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', pointerEvents: 'none' }}>
                  📑 Select PDF File
                </button>
              </div>
            </div>

            <button type="button" onClick={() => alert('Newspaper Published!')} style={{ width: '100%', background: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>🚀 Publish Newspaper</button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            <div style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800' }}>📅 Publication Calendar</span>
              <span style={{ background: '#1e293b', padding: '6px 14px', borderRadius: '8px', fontSize: '13px' }}>2026 ▾</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <div key={month} style={{ background: '#091322', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px' }}>
                  <h3 style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', marginBottom: '12px' }}>{month} 2026</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px' }}>
                    {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => <div key={d} style={{ color: '#475569' }}>{d}</div>)}
                    {Array.from({ length: 28 }).map((_, dIdx) => (
                      <div key={dIdx + 1} style={{ padding: '8px 0', borderRadius: '6px', background: 'transparent', color: '#94a3b8' }}>
                        {dIdx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}