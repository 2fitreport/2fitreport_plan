import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  title: string;
  content: string;
  date: string;
  start_date: string;
  end_date: string;
  author: string;
  created_at: string;
  updated_at: string;
  status: string;
};

export type Meeting = {
  id: string;
  title: string;
  content: string;
  date: string;
  start_date: string;
  end_date: string;
  author: string;
  created_at: string;
  updated_at: string;
};
