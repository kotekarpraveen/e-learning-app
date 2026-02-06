
import { createClient } from '@supabase/supabase-js';

// Helper to robustly get environment variables in various environments (Vite, CRA, Next, etc.)
const getEnvVar = (key: string): string => {
  // Check for Vite standard (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key] as string;
  }
  
  // Check for Node/CRA standard (process.env)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
    return supabaseUrl.length > 0 && 
           supabaseAnonKey.length > 0 &&
           !supabaseUrl.includes('your-project.supabase.co') && 
           !supabaseUrl.includes('placeholder') &&
           supabaseAnonKey !== 'your-anon-key-here';
};

// To prevent the app from crashing with "supabaseUrl is required" when no keys are provided,
// we initialize with a fallback URL. The app logic guards against using this client
// via isSupabaseConfigured(), so these dummy values won't actually be used for requests.
const clientUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(clientUrl, clientKey);
