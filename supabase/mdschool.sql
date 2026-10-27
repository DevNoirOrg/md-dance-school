-- =====================================================================
--  MD Dance School — adatbázis séma (Supabase / Postgres)
--
--  A közös Supabase projektben (MD Dance School, MD Dance Company, stúdió-
--  bérlés, Under Cover) minden oldal KÜLÖN SÉMÁBAN él; ez az `mdschool`.
--  Az app közvetlenül, szerveroldalon kapcsolódik a Postgreshez
--  (DATABASE_URL), ezért a sémát NEM kell a Supabase API-nak (PostgREST)
--  kiajánlani. A sorszintű védelem (RLS) be van kapcsolva szabályok nélkül,
--  így az anon / authenticated kulcsokkal semmi sem olvasható ki.
--
--  Biztonságosan újrafuttatható. Utána egyszer: mdschool-seed.sql.
-- =====================================================================

create schema if not exists mdschool;
revoke all on schema mdschool from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema mdschool from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Adminok — csak az itt szereplő e-mail címek léphetnek be az adminba.
-- ---------------------------------------------------------------------
create table if not exists mdschool.admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  Egy példányos tartalmak (hero, about, services, prices, courses,
--  schedule, news, camp, footer, form_options, privacy). Az érték JSON,
--  a szerkezetét az app ellenőrzi (lib/content-types.ts).
-- ---------------------------------------------------------------------
create table if not exists mdschool.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Ki és mikor módosított utoljára egy-egy tartalmi részt (admin kijelzés).
create table if not exists mdschool.edit_log (
  section    text primary key,
  updated_at timestamptz not null default now(),
  updated_by text not null
);

-- ---------------------------------------------------------------------
--  Órarend: termek (fülek) és az órák oszloponként
-- ---------------------------------------------------------------------
create table if not exists mdschool.rooms (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  short_name      text not null,
  column_headings text[] not null check (array_length(column_headings, 1) between 1 and 4),
  sort            integer not null default 0,
  updated_at      timestamptz not null default now(),
  updated_by      text
);

create table if not exists mdschool.classes (
  id      uuid primary key default gen_random_uuid(),
  room_id uuid not null references mdschool.rooms(id) on delete cascade,
  col     smallint not null check (col between 0 and 3),
  sort    integer not null default 0,
  time    text not null,
  title   text not null
);
create index if not exists classes_room_idx on mdschool.classes (room_id, col, sort);

-- ---------------------------------------------------------------------
--  Tanárok (főoldal „Tanáraink”, tánctábor, tanfolyamok)
-- ---------------------------------------------------------------------
create table if not exists mdschool.teachers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  style      text not null default '',
  image_path text not null,
  video_url  text not null default '',
  sort       integer not null default 0
);

-- ---------------------------------------------------------------------
--  Órajelentkezések
-- ---------------------------------------------------------------------
create table if not exists mdschool.applications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  status            text not null default 'uj'
                    check (status in ('uj', 'felvettuk', 'elutasitva', 'archivalt')),
  vezeteknev        text not null,
  keresztnev        text not null,
  email             text not null,
  szuletes          date not null,
  szulo_nev         text,
  szulo_email       text,
  tapasztalat       text not null,
  kezdes            text not null,
  megjegyzes        text not null default '',
  classes           text[] not null,
  consent_at        timestamptz not null,
  ip_hash           text,
  admin_note        text not null default '',
  status_updated_at timestamptz,
  status_updated_by text
);
create index if not exists applications_created_idx on mdschool.applications (created_at desc);
create index if not exists applications_ip_idx on mdschool.applications (ip_hash, created_at);

-- ---------------------------------------------------------------------
--  Tánctábor-jelentkezések
-- ---------------------------------------------------------------------
create table if not exists mdschool.camp_applications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  status            text not null default 'uj'
                    check (status in ('uj', 'felvettuk', 'elutasitva', 'archivalt')),
  nev               text not null,
  email             text not null,
  telefon           text not null,
  szuletes          date not null,
  polo              text not null default '',
  tudnivalo         text not null default '',
  szulo_nev         text not null default '',
  szulo_telefon     text not null default '',
  lakcim            text not null default '',
  turnus            text[] not null,
  fizetes           text not null default '',
  honnan            text not null default '',
  kitolto           text not null default '',
  consent_at        timestamptz not null,
  ip_hash           text,
  admin_note        text not null default '',
  status_updated_at timestamptz,
  status_updated_by text
);
create index if not exists camp_applications_created_idx on mdschool.camp_applications (created_at desc);
create index if not exists camp_applications_ip_idx on mdschool.camp_applications (ip_hash, created_at);

-- ---------------------------------------------------------------------
--  RLS: be, szabályok nélkül → a Supabase API-n át semmi sem érhető el.
-- ---------------------------------------------------------------------
alter table mdschool.admins            enable row level security;
alter table mdschool.settings          enable row level security;
alter table mdschool.edit_log          enable row level security;
alter table mdschool.rooms             enable row level security;
alter table mdschool.classes           enable row level security;
alter table mdschool.teachers          enable row level security;
alter table mdschool.applications      enable row level security;
alter table mdschool.camp_applications enable row level security;

-- ---------------------------------------------------------------------
--  Fájltároló (Storage): nyilvánosan olvasható "mdschool" bucket a
--  képeknek és videóknak. Feltölteni csak az admin tud (az app
--  szerveroldalon ad egyszer használatos feltöltési linket).
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('mdschool', 'mdschool', true, 52428800,
            array['image/webp', 'image/jpeg', 'image/png', 'video/mp4'])
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Megőrzés: az 1 évnél régebbi jelentkezések automatikus törlése
--  (ahogy az adatkezelési tájékoztató írja). Ehhez a pg_cron bővítmény
--  kell: Supabase → Integrations → Cron → Enable. Ha nincs bekapcsolva,
--  ez a rész csendben kimarad — bekapcsolás után futtasd újra a fájlt.
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'mdschool-applications-retention',
      '20 3 * * *',
      $job$delete from mdschool.applications where created_at < now() - interval '1 year';
           delete from mdschool.camp_applications where created_at < now() - interval '1 year'$job$
    );
  end if;
end $$;
