import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; secure`;
    } else if (event === 'SIGNED_OUT') {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
}
