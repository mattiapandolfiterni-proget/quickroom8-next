import { createClient } from '@supabase/supabase-js';

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
    
    // In development, throw to make the issue obvious
    if (process.env.NODE_ENV === 'development') {
      console.error(errorMsg);
      console.error('📖 See env.example for required variables');
    }
    
    // Log in production for debugging
    console.error(errorMsg);
  }
  
  return missing.length === 0;
};

const isConfigured = validateEnvVars();

// Create the Supabase client
// Uses empty strings if not configured (queries will fail gracefully)
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      // Only use localStorage on client side
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Export configuration status for components that need to check
export const isSupabaseConfigured = isConfigured;
