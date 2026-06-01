// Admin auth — backed by Supabase Auth (email/password) when configured,
// otherwise falls back to a sessionStorage flag (so the prototype still
// works during dev before the database is set up).
import { useEffect, useState } from "react";
import { supabase, HAS_SUPABASE } from "../lib/supabase";

const DEMO_KEY = "wd_admin_demo_session";
const DEMO_EVENT = "wd-admin-demo-session-changed";

export interface AdminSession {
  email: string | null;
  isDemo: boolean;
}

function readDemo(): AdminSession | null {
  const demo = sessionStorage.getItem(DEMO_KEY);
  return demo ? { email: demo, isDemo: true } : null;
}

export async function signIn(email: string, password: string): Promise<AdminSession> {
  if (!supabase) {
    // Offline / demo mode — accept anything, store flag, broadcast change.
    sessionStorage.setItem(DEMO_KEY, email || "demo");
    window.dispatchEvent(new Event(DEMO_EVENT));
    return { email: email || "demo", isDemo: true };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { email: data.user?.email ?? null, isDemo: false };
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem(DEMO_KEY);
  window.dispatchEvent(new Event(DEMO_EVENT));
  if (supabase) await supabase.auth.signOut();
}

export function useSession(): AdminSession | null {
  const [session, setSession] = useState<AdminSession | null>(() =>
    HAS_SUPABASE ? null : readDemo()
  );

  // Single effect with internal branching keeps hook count stable across HMR.
  useEffect(() => {
    if (!supabase) {
      const handle = () => setSession(readDemo());
      window.addEventListener(DEMO_EVENT, handle);
      return () => window.removeEventListener(DEMO_EVENT, handle);
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const u = data.session?.user;
      setSession(u ? { email: u.email ?? null, isDemo: false } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      const u = s?.user;
      setSession(u ? { email: u.email ?? null, isDemo: false } : null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return session;
}
