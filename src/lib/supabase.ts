// Supabase client. When env vars are missing we return null and the app
// falls back to in-memory DEFAULTS — useful during local dev before the
// database is provisioned, and as a safety net in production.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const HAS_SUPABASE = Boolean(URL && KEY);

export const supabase: SupabaseClient | null = HAS_SUPABASE
  ? createClient(URL!, KEY!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
