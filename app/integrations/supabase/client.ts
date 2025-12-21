import { createClient } from '@supabase/supabase-js';

// 🔒 Variabili d'ambiente (definite in .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ⚠️ Controllo di sicurezza: verifica che le chiavi siano configurate
if (!SUPABASE_URL) {
  console.error('❌ ERRORE: NEXT_PUBLIC_SUPABASE_URL non è definita! Controlla il file .env.local');
}
if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERRORE: NEXT_PUBLIC_SUPABASE_ANON_KEY non è definita! Controlla il file .env.local');
}

// 👇 CREA IL CLIENTE SUPABASE
export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
