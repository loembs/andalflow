import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/environment';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  if (config.isDevelopment) {
    console.warn(
      '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants. ' +
      'L’authentification Supabase ne sera pas disponible.'
    );
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
      },
    })
  : null;

