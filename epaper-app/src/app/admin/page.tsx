'use client';

import React, { useState } from 'react';
import { supabase, savePaperToDB } from '@/lib/data';

interface PageInput {
  pageNumber: number;
  file: File | null;
  previewUrl: string;
}

export default function AdminDashboard() {
  // Login States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Upload States
  const [date, setDate] = useState('');
  const [pages, setPages] = useState<PageInput[]>([
    { pageNumber: 1, file: null, previewUrl: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle Login Check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aap yahan apna Username aur Password change kar sakte hain
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('❌ Galat Username ya Password!');
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...pages];
    updated[index].file = file;
    if (file) {
      updated[index].previewUrl = URL.createObjectURL(file);
    }
    setPages(updated);
  };

  const addPageField = () => {
    setPages([...pages, { pageNumber: pages.length + 1, file: null, previewUrl: '' }]);
  };

  const handleSavePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a date');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const uploadedPages = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.file) {
          throw new Error(`Please select an image file for Page ${page.pageNumber}`);
        }

        const fileExt = page.file.name.split('.').pop();
        const fileName = `${date}_page_${page.pageNumber}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('newspapers')
          .upload(filePath, page.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Failed to upload Page ${page.pageNumber}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('newspapers')
          .getPublicUrl(filePath);

        uploadedPages.push({
          pageNumber: page.pageNumber,
          imageUrl: publicUrlData.publicUrl
        });
      }

      await savePaperToDB({ date, pages: uploadedPages });

      setMessage('✅ Newspaper successfully uploaded & published to Cloud!');
      setPages([{ pageNumber: 1, file: null, previewUrl: '' }]);
      setDate('');
    } catch (err: any) {
      console.error(err);
      setMessage('❌ Error: ' + (err.message || 'Failed to publish newspaper'));
    } finally {
      setLoading(false);
    }
  };

  // 1️⃣ SHIELD: Agar login nahi hai, toh Login Screen dikhao
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-slate-500 text-sm mt-2">E-Paper Panel ko access karne ke liye login karein</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow transition"
            >
              Login to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2️⃣ SUCCESS: Login hone ke baad Upload Form dikhao
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl my-8 font-sans border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">E-Paper Admin Panel</h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 font-bold ${message.includes('✅') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSavePaper} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Publish Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Upload Newspaper Page Files (JPG / PNG)</label>
          {pages.map((p, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 mb-4 p-4 border border-slate-200 rounded-2xl bg-slate-50 items-center">
              <span className="font-bold text-slate-700 w-20">Page {p.pageNumber}:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                className="flex-1 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                required
              />
              {p.previewUrl && (
                <img src={p.previewUrl} alt="Preview" className="w-16 h-20 object-cover rounded-lg border shadow-sm" />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPageField}
            className="mt-2 text-sm font-bold text-emerald-800 hover:underline"
          >
            + Add Another Page
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Uploading Images & Publishing to Cloud...' : 'Publish Newspaper to Cloud'}
        </button>
      </form>
    </div>
  );
}