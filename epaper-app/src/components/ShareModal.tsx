// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Download, Loader2 } from 'lucide-react';
import { getPaperFromDB } from '../lib/data'
import { jsPDF } from 'jspdf'; 

export default function ShareModal({ isOpen, onClose, selectedDate }: any) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=Read%20today's%20E-paper:%20${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=Read%20today's%20E-paper`,
  };

  // 🌟 PDF DOWNLOAD LOGIC 🌟
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const paper = await getPaperFromDB(selectedDate);
      if (!paper || !paper.pages || paper.pages.length === 0) {
        alert('No pages found for this date.');
        setDownloading(false);
        return;
      }

      // PDF Setup (A4 Size)
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const a4Width = 210;
      const a4Height = 297;

      for (let i = 0; i < paper.pages.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = paper.pages[i].imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Image ko A4 page par fit karne ki calculation
        const imgRatio = img.width / img.height;
        let finalWidth = a4Width;
        let finalHeight = a4Width / imgRatio;

        if (finalHeight > a4Height) {
          finalHeight = a4Height;
          finalWidth = finalHeight * imgRatio;
        }

        const x = (a4Width - finalWidth) / 2;
        const y = (a4Height - finalHeight) / 2;

        pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      }

      // 🌟 FILE DOWNLOAD 🌟
      pdf.save(`Fikr_o_Khayal_${selectedDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please check your network.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors">
          <X size={18} />
        </button>

        <div className="p-6 flex flex-col items-center mt-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Share2 size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Share E-Paper</h2>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-sm font-bold mb-8">
            {selectedDate} Edition
          </div>

          <div className="flex w-full justify-center gap-6 mb-8">
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <span className="text-xs font-bold text-slate-600">WhatsApp</span>
            </a>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <span className="text-xs font-bold text-slate-600">Facebook</span>
            </a>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </div>
              <span className="text-xs font-bold text-slate-600">Twitter</span>
            </a>
          </div>

          <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5 mb-4">
            <span className="text-xs text-slate-500 font-medium pl-3 truncate max-w-[200px]">{shareUrl}</span>
            <button onClick={handleCopy} className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* 🌟 NAYA DOWNLOAD BUTTON 🌟 */}
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 mt-2"
          >
            {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {downloading ? 'Preparing HD PDF...' : 'Download Full PDF'}
          </button>

        </div>
      </div>
    </div>
  );
}