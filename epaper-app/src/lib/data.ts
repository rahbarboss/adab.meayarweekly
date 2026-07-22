import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijypmnbsslabfnqltmbn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqeXBtbmJzc2xhYmZucWx0bWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjY1NzEsImV4cCI6MjEwMDIwMjU3MX0.yHBTVP2A0BAYDSK81cYKqxM7d22Iw_8b714K8wZJv1Y';

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

// Get Paper by Date from Supabase
export const getPaperFromDB = async (date: string): Promise<Newspaper | null> => {
  try {
    const { data, error } = await supabase
      .from('newspapers')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (error || !data) return null;
    return data as Newspaper;
  } catch (err) {
    return null;
  }
};

// Save / Update Paper in Supabase
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

// Get All Published Dates
export const getAllPapersFromDB = async (): Promise<Newspaper[]> => {
  try {
    const { data, error } = await supabase
      .from('newspapers')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return [];
    return data as Newspaper[];
  } catch (err) {
    return [];
  }
};

// Delete Paper from Supabase
export const deletePaperFromDB = async (date: string): Promise<boolean> => {
  const { error } = await supabase
    .from('newspapers')
    .delete()
    .eq('date', date);

  if (error) {
    console.error("Delete Error:", error);
    return false;
  }
  return true;
};