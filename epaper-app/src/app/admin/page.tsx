'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'calendar'>('upload');
  const [publishDate, setPublishDate] = useState('20-09-2026');
  const [pages, setPages] = useState<string[]>(['']);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rahbar786' && password === 'rahbar@786') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Username or Password');
    }
  };

  const addManualPage = () => {
    setPages([...pages, '']);
  };

  // 1. Admin Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#040914',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          background: '#091322',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            Admin Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
            Enter credentials to manage E-Paper
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#040914',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#040914',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            {loginError && (
              <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
              }}
            >
              Login to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Admin Dashboard (Matches Image 3 & 4)
  return (
    <div style={{
      minHeight: '100vh',
      background: '#040914',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Top Bar */}
      <header style={{
        padding: '20px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', letterSpacing: '-0.5px' }}>
            E-Paper Admin Panel
          </h1>
          <p style={{ color: '#64748b', fontSize: '12px' }}>
            Manage publications & Cloud Storage
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              background: activeTab === 'upload' ? '#10b981' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            + Upload Paper
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              background: activeTab === 'calendar' ? '#6366f1' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📅 ALL PAPERS
          </button>

          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              background: '#7f1d1d',
              color: '#fca5a5',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '36px', display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'upload' ? (
          /* Upload Card (Matches Image 3) */
          <div style={{
            background: '#091322',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              📑 Upload E-Paper Edition
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                Publish Date
              </label>
              <div style={{
                background: '#040914',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>📅 {publishDate}</span>
                <button
                  type="button"
                  style={{
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Change Date
                </button>
              </div>
            </div>

            {/* Drag Drop PDF Box */}
            <div style={{
              border: '2px dashed #0d9488',
              borderRadius: '14px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(13, 148, 136, 0.03)',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>
                Upload Full PDF Document
              </h3>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>
                Upload a single PDF. We will auto-extract all pages into HD images instantly.
              </p>
              <button
                type="button"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                📑 Select PDF File
              </button>
            </div>

            {/* Extracted Pages */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
                  Extracted Pages (Review before Publish)
                </span>
                <span style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {pages.length} Pages
                </span>
              </div>

              {pages.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#040914',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', minWidth: '40px' }}>
                    Pg {idx + 1}:
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addManualPage}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '6px 0',
                  marginTop: '4px'
                }}
              >
                + Add manual image page
              </button>
            </div>

            {/* Publish Button */}
            <button
              type="button"
              onClick={() => alert('Newspaper Published Successfully!')}
              style={{
                width: '100%',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              🚀 Publish Newspaper to Cloud
            </button>
          </div>
        ) : (
          /* Calendar Grid (Matches Image 4) */
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            <div style={{
              background: '#091322',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '800' }}>📅 Publication Calendar</span>
              <span style={{ background: '#1e293b', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                2026 ▾
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'].map((month, i) => (
                <div
                  key={month}
                  style={{
                    background: '#091322',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  <h3 style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', marginBottom: '12px' }}>
                    {month} 2026
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '4px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                      <div key={d} style={{ color: '#475569', padding: '4px 0' }}>{d}</div>
                    ))}
                    {Array.from({ length: 28 }).map((_, dIdx) => {
                      const day = dIdx + 1;
                      const isPublished = (month === 'September' && (day === 19 || day === 20));
                      return (
                        <div
                          key={day}
                          style={{
                            padding: '8px 0',
                            borderRadius: '6px',
                            background: isPublished ? '#064e3b' : 'transparent',
                            border: isPublished ? '1px solid #10b981' : 'none',
                            color: isPublished ? '#a7f3d0' : '#94a3b8',
                            position: 'relative'
                          }}
                        >
                          {day}
                          {isPublished && (
                            <div style={{ fontSize: '8px', marginTop: '1px' }}>✏️🗑️</div>
                          )}
                        </div>
                      );
                    })}
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