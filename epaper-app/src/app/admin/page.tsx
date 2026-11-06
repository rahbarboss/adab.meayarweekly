'use client';
import React, { useState } from 'react';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'calendar'>('upload');
  const [publishDate, setPublishDate] = useState('2026-09-20');
  const [pages, setPages] = useState<string[]>(['']);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rahbar786' && password === 'rahbar@786') setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    // ... Login UI exactly as before ...
    return (
      <div style={{ minHeight: '100vh', background: '#040914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#091322', padding: '36px', borderRadius: '16px', border: '1px solid #1e293b' }}>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '800' }}>Admin Portal</h1>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ display: 'block', width: '300px', margin: '16px 0 10px', padding: '10px' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ display: 'block', width: '300px', marginBottom: '16px', padding: '10px' }} />
          <button type="submit" style={{ background: '#0d9488', color: '#fff', padding: '10px', width: '100%' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: '#040914', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 36px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <div><h1 style={{ color: '#10b981', margin: 0 }}>E-Paper Admin</h1></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('upload')} style={{ background: activeTab === 'upload' ? '#10b981' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px' }}>Upload</button>
          <button onClick={() => setActiveTab('calendar')} style={{ background: activeTab === 'calendar' ? '#6366f1' : '#1e293b', color: '#fff', padding: '8px 16px', borderRadius: '8px' }}>Calendar</button>
        </div>
      </header>

      {/* Overflow auto lagaya taaki scroll kaam kare */}
      <main style={{ padding: '36px', overflowY: 'auto', flex: 1, display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'upload' ? (
          <div style={{ background: '#091322', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '680px' }}>
            <h2 style={{ color: '#10b981', marginBottom: '20px' }}>Upload E-Paper</h2>
            
            {/* Real Date Picker */}
            <input 
              type="date" 
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              style={{ background: '#040914', color: '#fff', border: '1px solid #1e293b', padding: '10px', borderRadius: '8px', marginBottom: '20px', width: '100%' }}
            />
            
            <button onClick={() => alert('Published!')} style={{ background: '#10b981', color: '#fff', padding: '14px', width: '100%', borderRadius: '10px', fontWeight: 'bold' }}>Publish</button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <div key={month} style={{ background: '#091322', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px' }}>
                  <h3 style={{ textAlign: 'center' }}>{month} 2026</h3>
                  <div style={{ height: '150px' }}></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}