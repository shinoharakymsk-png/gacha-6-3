import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    (typeof window !== 'undefined' && localStorage.getItem('user_supabase_url')) ||
    (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url')
  );
};

export const getSupabaseClient = () => {
  let url = supabaseUrl;
  let key = supabaseAnonKey;

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('user_supabase_url');
    const localKey = localStorage.getItem('user_supabase_anon_key');
    if (localUrl && localKey) {
      url = localUrl;
      key = localKey;
    }
  }

  if (!url || !key || url === 'your-supabase-url') {
    return null;
  }

  return createClient(url, key);
};
