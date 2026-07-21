import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ijypmnbsslabfnqltmbn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqeXBtbmJzc2xhYmZucWx0bWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjY1NzEsImV4cCI6MjEwMDIwMjU3MX0.yHBTVP2A0BAYDSK81cYKqxM7d22Iw_8b714K8wZJv1Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface NewspaperPage {
  pageNumber: number;
  imageUrl: string;
}

export interface Newspaper {
  id?: string;
  date: string;
  pages: NewspaperPage[];
}

const defaultPaper: Newspaper = {
  date: '2026-07-21',
  pages: [
    { pageNumber: 1, imageUrl: 'https://placehold.co/800x1130/065f46/ffffff?text=Adab+e+Meayar+Page+1' },
    { pageNumber: 2, imageUrl: 'https://placehold.co/800x1130/1e293b/ffffff?text=Adab+e+Meayar+Page+2' },
    { pageNumber: 3, imageUrl: 'https://placehold.co/800x1130/0f172a/ffffff?text=Adab+e+Meayar+Page+3' }
  ]
};

// Save to Supabase Cloud
export const savePaperToDB = async (paperData: { date: string; pages: { pageNumber: number; imageUrl: string }[] }) => {
  const { data, error } = await supabase
    .from('newspapers')
    .upsert([{ date: paperData.date, pages: paperData.pages }], { onConflict: 'date' });

  if (error) {
    console.error("Supabase Save Error:", error);
    throw error;
  }
  return data;
};

// Get Paper from Supabase Cloud
export const getPaperFromDB = async (date: string): Promise<Newspaper> => {
  try {
    const { data, error } = await supabase
      .from('newspapers')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (error || !data) {
      return { ...defaultPaper, date };
    }

    return data as Newspaper;
  } catch (err) {
    return { ...defaultPaper, date };
  }
};

// Get All Papers from Supabase Cloud
export const getAllPapersFromDB = async (): Promise<Newspaper[]> => {
  try {
    const { data, error } = await supabase
      .from('newspapers')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data || data.length === 0) {
      return [defaultPaper];
    }

    return data as Newspaper[];
  } catch (err) {
    return [defaultPaper];
  }
};

// Delete Paper from Supabase Cloud
export const deletePaperFromDB = async (date: string): Promise<boolean> => {
  const { error } = await supabase
    .from('newspapers')
    .delete()
    .eq('date', date);

  if (error) {
    return false;
  }
  return true;
};