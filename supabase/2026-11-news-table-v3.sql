-- =====================================================================
--  MD Dance School — v3: hírek saját adattábla + saját /hirek/<slug> oldal
--
--  Korábban (v1/v2) a 9 hír a mdschool.settings 'news' kulcsának jsonb
--  'items' tömbjében élt (csak kép + alt + link). A felhasználói döntés
--  (grillezés) alapján a hírek most saját cikk-modellt kapnak az
--  under-cover-dance-school mintájára: saját tábla, saját oldal (/hirek/
--  <slug>), admin WYSIWYG szerkesztő. Bilingual mezők NEM kerülnek be
--  (külön, későbbi kérésre).
--
--  NEM destruktív: nem törli a settings.news.items régi tartalmát (csak
--  a kódban szűnik meg a használata) — ha vissza kellene állítani, megvan.
--  A teljes script `where not exists` / `on conflict do nothing` védett,
--  többször is futtatható.
-- =====================================================================

-- ---------------------------------------------------------------------
--  0) ELLENŐRZÉS FUTTATÁS ELŐTT — csak olvas.
-- ---------------------------------------------------------------------
select key, jsonb_pretty(value) from mdschool.settings where key = 'news';
select count(*) as news_count from mdschool.news;


-- ---------------------------------------------------------------------
--  1) TÁBLA — mdschool.news (bilingual mezők nélkül).
-- ---------------------------------------------------------------------
create table if not exists mdschool.news (
  id                uuid primary key default gen_random_uuid(),
  published_on      date not null default current_date,
  slug              text not null unique,
  title             text not null,
  excerpt           text not null default '',
  body_html         text not null default '',
  image_path        text,
  image_alt         text,
  placeholder_label text not null default '',
  format            text not null default 'landscape' check (format in ('landscape', 'portrait')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  updated_by        text
);
create index if not exists news_published_idx on mdschool.news (published_on desc, created_at desc);


-- ---------------------------------------------------------------------
--  2) ÁTTÖLTÉS — a 9, v1/v2-ben betöltött hír a táblába kerül (ha még
--     nincs ott — "on conflict (slug) do nothing"). A body_html egyelőre
--     csak egy mondat, ami az eredeti (hiphoptanciskola.com) cikkre
--     mutat — ezt kell az adminban a valódi szövegre cserélni.
--     A published_on dátumok ILEIDEIGLENESEK (a sorrend tartása miatt
--     csökkenő, egyenként egy nappal korábbi) — az adminban pontosítható.
-- ---------------------------------------------------------------------
insert into mdschool.news (published_on, slug, title, excerpt, body_html, image_path, image_alt, placeholder_label, format)
values
  (current_date - 0, 'afro-collab-workshop-oktober-24', 'Afro Collab Workshop – Október 24', 'Afro Collab Workshop – Október 24',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/50327-2/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'Afro Collab Workshop – Október 24', 'Afro Collab Workshop – Október 24', 'landscape'),

  (current_date - 1, 'access-003-workshop-shona-wilson-uk', 'ACCESS 003 WORKSHOP – Shona Wilson (UK)', 'ACCESS 003 WORKSHOP – Shona Wilson (UK)',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/access-003-workshop-shona-wilson-uk-%f0%9f%87%ac%f0%9f%87%a7/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'ACCESS 003 WORKSHOP – Shona Wilson (UK)', 'ACCESS 003 WORKSHOP – Shona Wilson (UK)', 'landscape'),

  (current_date - 2, 'md-afterdark-party', 'MD Afterdark Party', 'MD Afterdark Party',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/md-afterdark-party/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'MD Afterdark Party', 'MD Afterdark Party', 'portrait'),

  (current_date - 3, 'access-004-workshop-peter-valentin-ita', 'ACCESS 004 WORKSHOP – Peter Valentin (ITA)', 'ACCESS 004 WORKSHOP – Peter Valentin (ITA)',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/access-003-workshop-peter-valentin-ita-%f0%9f%87%ae%f0%9f%87%b9/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'ACCESS 004 WORKSHOP – Peter Valentin (ITA)', 'ACCESS 004 WORKSHOP – Peter Valentin (ITA)', 'landscape'),

  (current_date - 4, 'uj-oratipus-kezdo-commercial-girly-class', 'Új óratípus: Kezdő Commercial / Girly Class', 'Új óratípus: Kezdő Commercial / Girly Class',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/uj-oratipus-kezdo-commercial-girly-classsz/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'Új óratípus: Kezdő Commercial / Girly Class', 'Új óratípus: Kezdő Commercial / Girly Class', 'landscape'),

  (current_date - 5, 'lia-visszater-girly-high-heels-pentekenkent', 'Lia visszatér – Girly & High Heels péntekenként', 'Lia visszatér – Girly & High Heels péntekenként',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/lia-visszater-girly-high-heels-pentekenkent-%f0%9f%92%8b%f0%9f%91%a0/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'Lia visszatér – Girly & High Heels péntekenként', 'Lia visszatér – Girly & High Heels péntekenként', 'portrait'),

  (current_date - 6, 'access-workshop-bianca-torres-aponte-aaron-quini-us', 'ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)', 'ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/access-workshop-october-3-bianca-torres-aponte-aaron-quini-us/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)', 'ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)', 'landscape'),

  (current_date - 7, 'afro-dance-workshop-jayson-x-flexx', 'Afro Dance Workshop – Jayson x Flexx', 'Afro Dance Workshop – Jayson x Flexx',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/afro-dance-workshop-jayson-x-flexx/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'Afro Dance Workshop – Jayson x Flexx', 'Afro Dance Workshop – Jayson x Flexx', 'landscape'),

  (current_date - 8, 'dalma-x-lili-collab-dance-workshop', 'Dalma x Lili Collab Dance Workshop', 'Dalma x Lili Collab Dance Workshop',
   '<p>A teljes cikk ideiglenesen itt olvasható: <a href="https://hiphoptanciskola.com/dalma-x-lili-collab-dance-workshop/" target="_blank" rel="noopener noreferrer">itt</a>. Cseréld ki ezt a szöveget az adminban a valódi tartalomra.</p>',
   null, 'Dalma x Lili Collab Dance Workshop', 'Dalma x Lili Collab Dance Workshop', 'landscape')
on conflict (slug) do nothing;


-- ---------------------------------------------------------------------
--  ELLENŐRZÉS FUTTATÁS UTÁN
-- ---------------------------------------------------------------------
select slug, published_on, title, format, image_path from mdschool.news order by published_on desc, created_at desc;
