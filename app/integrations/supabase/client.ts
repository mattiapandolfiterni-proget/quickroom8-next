import { createClient } from '@supabase/supabase-js';

// 🔥 VALORI PRESI DAL TUO SUPABASE
const SUPABASE_URL = "https://nsrmulajd7grespugknx.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb-publishable-mJREcr8rR9bMqWgpwQzw_d2dwMHR";

// 👇 CREA IL CLIENTE SUPABASE
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});