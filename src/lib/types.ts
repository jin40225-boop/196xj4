// Shared content types used by both public site and admin.
// Mirrors the schema defined in supabase/migrations/0001_init.sql.

export interface SiteHero {
  eyebrow: string;
  titleA: string;
  titleB: string;
  titleHl: string;
  titleC: string;
  lead: string;
}

export interface SiteAbout {
  lead: string;
  intro: string;
  origin1: string;
  origin2: string;
  quote: string;
}

export interface SiteContact {
  email: string;
  line: string;
  org: string;
  phone?: string;
  address?: string;
}

export interface SiteContent {
  hero: SiteHero;
  about: SiteAbout;
  contact: SiteContact;
  membershipNote: string;
  footerTagline: string;
}

export type NewsCategory = "會員招募" | "協會公告" | "活動預告" | "活動花絮";

export interface NewsItem {
  id: string;
  date: string; // YYYY-MM-DD
  category: NewsCategory | string;
  icon: string; // lucide icon name
  title: string;
  excerpt: string;
  body: string;
  published: boolean;
  created_at?: string;
}

export type MemberType = "個人會員" | "團體會員" | "贊助會員";
export type MemberStatus = "已繳費" | "審查中";

export interface Member {
  id: string;
  name: string;
  type: MemberType | string;
  date: string; // YYYY-MM-DD
  status: MemberStatus | string;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at?: string;
  handled?: boolean;
}
