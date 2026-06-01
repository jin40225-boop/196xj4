-- White Dew initial schema
-- Run this once in your Supabase project (Dashboard > SQL Editor > New query, paste, run).
-- Idempotent: safe to re-run.

-- =====================================================================
-- Tables
-- =====================================================================

-- site_content: single-row JSON blob for editable page text.
-- Why a single row? Keeps the admin "頁面內容" editor simple — one upsert
-- replaces the whole site config.
create table if not exists public.site_content (
  id            int primary key default 1,
  data          jsonb not null,
  updated_at    timestamptz not null default now()
);

-- news items shown on the public site.
create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  category      text not null,
  icon          text not null default 'megaphone',
  title         text not null,
  excerpt       text not null default '',
  body          text not null default '',
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists news_date_idx on public.news (date desc);
create index if not exists news_published_idx on public.news (published);

-- members managed by admin only.
create table if not exists public.members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default '個人會員',
  date          date not null default current_date,
  status        text not null default '審查中',
  email         text,
  phone         text,
  note          text,
  created_at    timestamptz not null default now()
);

-- contact form submissions.
create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  topic         text not null,
  message       text not null default '',
  handled       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- =====================================================================
-- updated_at auto-touch
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table public.site_content     enable row level security;
alter table public.news             enable row level security;
alter table public.members          enable row level security;
alter table public.contact_messages enable row level security;

-- site_content: everyone can read; only authenticated users can write.
drop policy if exists "site_content read"  on public.site_content;
drop policy if exists "site_content write" on public.site_content;
create policy "site_content read"  on public.site_content for select using (true);
create policy "site_content write" on public.site_content
  for all to authenticated using (true) with check (true);

-- news: public can read published items only; authenticated can do anything.
drop policy if exists "news public read"    on public.news;
drop policy if exists "news admin read all" on public.news;
drop policy if exists "news admin write"    on public.news;
create policy "news public read"    on public.news for select using (published = true);
create policy "news admin read all" on public.news for select to authenticated using (true);
create policy "news admin write"    on public.news for all to authenticated using (true) with check (true);

-- members: admin only (no public access at all).
drop policy if exists "members admin all" on public.members;
create policy "members admin all" on public.members
  for all to authenticated using (true) with check (true);

-- contact_messages: anyone can submit; only admin can read/update.
drop policy if exists "messages public insert" on public.contact_messages;
drop policy if exists "messages admin read"    on public.contact_messages;
drop policy if exists "messages admin update"  on public.contact_messages;
create policy "messages public insert" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "messages admin read" on public.contact_messages
  for select to authenticated using (true);
create policy "messages admin update" on public.contact_messages
  for update to authenticated using (true) with check (true);

-- =====================================================================
-- Realtime: publish change events for the three live tables
-- =====================================================================
-- Supabase Realtime listens on the `supabase_realtime` publication.
-- Add tables one at a time, ignore "already member" errors.
do $$ begin
  perform 1 from pg_publication where pubname = 'supabase_realtime';
  if found then
    begin alter publication supabase_realtime add table public.site_content; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.news;         exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.members;      exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.contact_messages; exception when duplicate_object then null; end;
  end if;
end $$;
