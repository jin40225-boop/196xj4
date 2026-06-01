// Admin auth — backed by Supabase Auth (email/password) when configured,
// otherwise falls back to a sessionStorage flag (so the prototype still
// works during dev before the database is set up).
import { useEffect, useState } from "react";
import { supabase, HAS_SUPABASE } from "../lib/supabase";

const DEMO_KEY = "wd_admin_demo_session";

export interface AdminSession {
  email: string | null;
  isDemo: boolean;
}

export async function signIn(email: string, password: string): Promise<AdminSession> {
  if (!supabase) {
    // Offline / demo mode — accept anything, store flag.
    sessionStorage.setItem(DEMO_KEY, email || "demo");
    return { email: email || "demo", isDemo: true };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { email: data.user?.email ?? null, isDemo: false };
}

export async function signOut(): Promise<void> {
  sessionStorage.removeItem(DEMO_KEY);
  if (supabase) await supabase.auth.signOut();
}

export function useSession(): AdminSession | null {
  const [session, setSession] = useState<AdminSession | null>(() => {
    const demo = sessionStorage.getItem(DEMO_KEY);
    if (!HAS_SUPABASE && demo) return { email: demo, isDemo: true };
    return null;
  });

  useEffect(() => {
    if (!supabase) return;
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
