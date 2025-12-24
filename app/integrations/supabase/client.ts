import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables - MUST be set in Vercel dashboard
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables at module load time
// This provides clear error messages in development and production logs
const validateEnvVars = () => {
  const missing: string[] = [];
  
  if (!SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (missing.length > 0) {
    const errorMsg = `❌ Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file (local dev) or Vercel Environment Variables (production).';
    
    // Log in both dev and production for debugging
    console.error(errorMsg);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('📖 See env.example for required variables');
    }
  }
  
  return missing.length === 0;
};

const isConfigured = validateEnvVars();

// FIX: Improved auth storage handling for production
// - Uses localStorage only on client side
// - Handles edge cases where localStorage might be unavailable
const getAuthStorage = () => {
  // Server-side: no storage
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  // Client-side: try localStorage, fallback to in-memory
  try {
    // Test localStorage availability
    const testKey = '__supabase_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    // localStorage not available (private browsing, etc.)
    // Supabase will use in-memory storage
    console.warn('localStorage not available, using in-memory session storage');
    return undefined;
  }
};

// Create the Supabase client
// FIX: Better handling of unconfigured state
let supabaseClient: SupabaseClient;

if (isConfigured && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        storage: getAuthStorage(),
        persistSession: true,
        autoRefreshToken: true,
        // FIX: Detect URL for auth redirects (important for Vercel production)
        detectSessionInUrl: true,
        // FIX: Flow type for better compatibility
        flowType: 'pkce',
      },
      // FIX: Global settings for better error handling
      global: {
        headers: {
          'x-client-info': 'quickroom8-web',
        },
      },
    }
  );
} else {
  // Create a placeholder client that will fail gracefully
  // This prevents crashes when env vars are missing
  supabaseClient = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const supabase = supabaseClient;

// Export configuration status for components that need to check
export const isSupabaseConfigured = isConfigured;

// FIX: Helper to check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';
