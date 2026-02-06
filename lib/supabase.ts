
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
    if (!supabaseUrl || !supabaseAnonKey) return false;

    // Check for default/example values that should trigger Mock Mode
    const isPlaceholder = 
        supabaseUrl.includes('your-project') || 
        supabaseUrl.includes('placeholder') ||
        supabaseAnonKey === 'your-anon-key-here' ||
        supabaseAnonKey.includes('placeholder');

    // Strict validation: Must look like a real Supabase URL to avoid CORS errors
    // trying to hit the frontend app URL (common misconfiguration)
    const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');

    return !isPlaceholder && isValidUrl;
};

// Fallback client creation. 
// If not configured, this client points to a dummy URL but is guarded by isSupabaseConfigured() in api.ts
const clientUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(clientUrl, clientKey);
