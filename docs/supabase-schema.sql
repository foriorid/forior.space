-- Forior Space — Supabase schema
-- Jalankan ini di Supabase: menu SQL Editor -> New query -> Run.

-- 1) Tabel listing (seluruh objek listing disimpan di kolom jsonb `doc`)
create table if not exists public.listings (
  id          text primary key,
  status      text not null default 'draft',
  updated_at  timestamptz not null default now(),
  doc         jsonb not null
);

create index if not exists listings_status_idx     on public.listings (status);
create index if not exists listings_updated_at_idx on public.listings (updated_at desc);

-- 2) Tabel pengaturan (nama agen & nomor WhatsApp) — satu baris
create table if not exists public.settings (
  id    text primary key,
  data  jsonb not null
);

-- 3) Keamanan: aktifkan RLS tapi JANGAN bikin policy publik.
--    App memakai service-role key dari server (bypass RLS), jadi tidak ada
--    akses langsung dari browser. Ini aman.
alter table public.listings enable row level security;
alter table public.settings enable row level security;

-- 4) Storage bucket untuk foto (PUBLIC agar foto bisa ditampilkan).
--    Cara termudah lewat UI: Storage -> New bucket -> nama "listings" -> centang "Public".
--    Atau jalankan SQL ini:
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do update set public = true;
