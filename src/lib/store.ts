// White Dew shared store.
// Backed by Supabase when configured, by in-memory DEFAULTS otherwise.
//
// Both the public site and admin read/write through this single module so
// admin edits show up live in the public site (via Supabase realtime, or
// via local subscribe() callbacks in offline mode).
import { useEffect, useState } from "react";
import { supabase, HAS_SUPABASE } from "./supabase";
import { DEFAULT_SITE, DEFAULT_NEWS, DEFAULT_MEMBERS } from "./defaults";
import type {
  SiteContent,
  NewsItem,
  Member,
  ContactMessage,
  SiteAbout,
  SiteContact,
  SiteHero,
} from "./types";

/* ---------- in-memory state used both as cache and as offline mode ---------- */
let _site: SiteContent = structuredClone(DEFAULT_SITE);
let _news: NewsItem[] = structuredClone(DEFAULT_NEWS);
let _members: Member[] = structuredClone(DEFAULT_MEMBERS);
let _loaded = !HAS_SUPABASE; // offline mode is "loaded" immediately

const subs = new Set<() => void>();
function notify() {
  subs.forEach((f) => f());
}

/* ---------- initial load + realtime subscriptions ---------- */
async function loadAll(): Promise<void> {
  if (!supabase) return;
  const [{ data: site }, { data: news }, { data: members }] = await Promise.all([
    supabase.from("site_content").select("data").eq("id", 1).maybeSingle(),
    supabase
      .from("news")
      .select("id,date,category,icon,title,excerpt,body,published,created_at")
      .order("date", { ascending: false }),
    supabase
      .from("members")
      .select("id,name,type,date,status,email,phone,note")
      .order("date", { ascending: false }),
  ]);
  if (site?.data) _site = { ...DEFAULT_SITE, ...(site.data as SiteContent) };
  if (news) _news = news as NewsItem[];
  if (members) _members = members as Member[];
  _loaded = true;
  notify();
}

function attachRealtime() {
  if (!supabase) return;
  supabase
    .channel("wd-site")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "news" }, loadAll)
    .on("postgres_changes", { event: "*", schema: "public", table: "members" }, loadAll)
    .subscribe();
}

if (HAS_SUPABASE) {
  loadAll().catch((err) => {
    console.warn("[WDStore] initial load failed, using DEFAULTS:", err);
    _loaded = true;
    notify();
  });
  attachRealtime();
}

/* ---------- public API ---------- */
export const WDStore = {
  isLoaded: () => _loaded,
  getSite: () => _site,
  getNews: () => _news,
  getMembers: () => _members,
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => subs.delete(fn);
  },

  /* ---- site content ---- */
  async updateSiteSection<K extends keyof SiteContent>(
    key: K,
    patch: Partial<SiteContent[K]>
  ): Promise<void> {
    const current = _site[key];
    if (typeof current === "object" && current !== null) {
      _site = { ..._site, [key]: { ...(current as object), ...(patch as object) } } as SiteContent;
    } else {
      _site = { ..._site, [key]: patch as SiteContent[K] };
    }
    notify();
    if (supabase) {
      await supabase.from("site_content").upsert({ id: 1, data: _site });
    }
  },
  async updateSiteRoot(patch: Partial<SiteContent>): Promise<void> {
    _site = { ..._site, ...patch };
    notify();
    if (supabase) {
      await supabase.from("site_content").upsert({ id: 1, data: _site });
    }
  },

  /* ---- news CRUD ---- */
  async addNews(item: Omit<NewsItem, "id">): Promise<string> {
    const tempId = "tmp-" + Math.random().toString(36).slice(2, 8);
    const created: NewsItem = { id: tempId, ...item };
    _news = [created, ..._news];
    notify();
    if (supabase) {
      const { data, error } = await supabase
        .from("news")
        .insert([{ ...item }])
        .select()
        .single();
      if (error) throw error;
      _news = _news.map((n) => (n.id === tempId ? (data as NewsItem) : n));
      notify();
      return (data as NewsItem).id;
    }
    return tempId;
  },
  async updateNews(id: string, patch: Partial<NewsItem>): Promise<void> {
    _news = _news.map((n) => (n.id === id ? { ...n, ...patch } : n));
    notify();
    if (supabase) {
      const { error } = await supabase.from("news").update(patch).eq("id", id);
      if (error) throw error;
    }
  },
  async deleteNews(id: string): Promise<void> {
    _news = _news.filter((n) => n.id !== id);
    notify();
    if (supabase) {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    }
  },

  /* ---- members ---- */
  async addMember(item: Omit<Member, "id">): Promise<string> {
    const tempId = "tmp-" + Math.random().toString(36).slice(2, 8);
    _members = [{ id: tempId, ...item }, ..._members];
    notify();
    if (supabase) {
      const { data, error } = await supabase.from("members").insert([item]).select().single();
      if (error) throw error;
      _members = _members.map((m) => (m.id === tempId ? (data as Member) : m));
      notify();
      return (data as Member).id;
    }
    return tempId;
  },
  async updateMember(id: string, patch: Partial<Member>): Promise<void> {
    _members = _members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    notify();
    if (supabase) {
      const { error } = await supabase.from("members").update(patch).eq("id", id);
      if (error) throw error;
    }
  },
  async deleteMember(id: string): Promise<void> {
    _members = _members.filter((m) => m.id !== id);
    notify();
    if (supabase) {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    }
  },

  /* ---- contact form ---- */
  async submitContact(msg: Omit<ContactMessage, "id" | "created_at" | "handled">): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("contact_messages").insert([msg]);
      if (error) throw error;
    } else {
      console.info("[WDStore offline] contact submission:", msg);
    }
  },
};

/* ---------- React hook ---------- */
export function useStore(): { site: SiteContent; news: NewsItem[]; members: Member[]; loaded: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = WDStore.subscribe(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);
  return {
    site: WDStore.getSite(),
    news: WDStore.getNews(),
    members: WDStore.getMembers(),
    loaded: WDStore.isLoaded(),
  };
}

/* re-export for convenience */
export type { SiteContent, NewsItem, Member, SiteAbout, SiteContact, SiteHero };
