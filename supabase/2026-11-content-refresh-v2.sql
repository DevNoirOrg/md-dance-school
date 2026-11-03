-- =====================================================================
--  MD Dance School — tartalom-frissítés v2
--
--  Miért v2: a v1 script (2026-11-content-refresh.sql) a Lili/Alex
--  duplikálásnál és a hírek frissítésénél a MEGLÉVŐ sorokra épített
--  (INSERT ... SELECT FROM, illetve UPDATE ... WHERE key = 'news').
--  Ha a `mdschool.teachers` / `mdschool.settings` tábla akkor még
--  üres volt (a mdschool-seed.sql sosem futott le élesben), ezek a
--  lekérdezések 0 sort találtak, és NEM csináltak semmit — ez magyarázza,
--  hogy miért tűntek el a tanárok (korábban DATABASE_URL hiányában a
--  lib/defaults.ts-ből jött az 5 "hamis" tanár, most hogy az adatbázis
--  aktív, az üres tábla valódi, 0 tanáros állapotot mutat), és miért
--  nem változtak a hírek.
--
--  Ez a script ÖNÁLLÓAN, a meglévő sorok nélkül is garantálja a 6 tanár
--  + 2 duplikátum meglétét, és a hírek sorát is létrehozza, ha hiányzik
--  (upsert). Ha a v1 már bármit létrehozott, ez nem duplikál (minden
--  beszúrás `where not exists` védett).
--
--  FONTOS: a `hasDb()` (lib/db.ts) csak azt nézi, van-e DATABASE_URL —
--  ha van, a defaults.ts-t EGYÁLTALÁN nem használja, még akkor sem, ha
--  egy tábla üres. Üres tábla = üres lista a nyilvános oldalon, nem a
--  defaults.ts-beli helyőrző adat.
-- =====================================================================

-- ---------------------------------------------------------------------
--  0) ELLENŐRZÉS — csak olvas. Futtasd ezt ELŐSZÖR, és nézd meg, hány
--     sor van most valójában; ez megerősíti/cáfolja a fenti diagnózist.
-- ---------------------------------------------------------------------
select count(*) as teachers_count from mdschool.teachers;
select name, style, sort from mdschool.teachers order by sort, name;
select count(*) as settings_rows, array_agg(key) as keys from mdschool.settings;


-- ---------------------------------------------------------------------
--  1) TANÁROK — a 6 ismert tanár garantált létezése (ha hiányzik, létrejön
--     a lib/defaults.ts-ben már most is szereplő fotóval; Lia fotója
--     nincs meg a kódban, ő image_path = '' -vel jön létre — ezt fel kell
--     tölteni az adminban), PLUSZ a Lili/Alex duplikálás a Girly/House
--     kártyákra. Minden sor `where not exists` véd a duplikálás ellen,
--     akárhányszor futtatható.
-- ---------------------------------------------------------------------

-- 1a) alap tanárok, ha még nincsenek (a stílus itt az "eredeti", nem duplikált)
insert into mdschool.teachers (name, style, image_path, video_url, sort)
select v.name, v.style, v.image_path, v.video_url, v.sort
from (values
  ('Jayson', 'Afro',            '/canva/teacher-04-orangejersey.jpg', 'https://www.instagram.com/', 0),
  ('Lili',   'Koreográfia',     '/canva/teacher-03-redpants.jpg',     'https://www.instagram.com/', -40),
  ('Dalma',  'Hip-Hop',         '/canva/teacher-02-soxcap.jpg',       'https://www.instagram.com/', 0),
  ('Alex',   'Hip-Hop',         '/canva/teacher-01-beanie.jpg',       'https://www.instagram.com/', -20),
  ('Oliver', 'Hip-Hop',         '/canva/teacher-05-stool.jpg',        'https://www.instagram.com/', 0),
  ('Lia',    'Girly, High Heels', '',                                 'https://www.instagram.com/', 0)
) as v(name, style, image_path, video_url, sort)
where not exists (
  select 1 from mdschool.teachers t where t.name = v.name
);

-- 1b) Lili és Alex duplikálása külön kártyára (Girly / House) — a FRISSEN
--     létrehozott vagy a már meglévő sorból másolja a fotót/Insta-linket.
insert into mdschool.teachers (name, style, image_path, video_url, sort)
select name, 'Girly', image_path, video_url, -30
from mdschool.teachers
where name = 'Lili' and style <> 'Girly'
  and not exists (select 1 from mdschool.teachers where name = 'Lili' and style = 'Girly')
order by sort limit 1;

insert into mdschool.teachers (name, style, image_path, video_url, sort)
select name, 'House', image_path, video_url, -10
from mdschool.teachers
where name = 'Alex' and style <> 'House'
  and not exists (select 1 from mdschool.teachers where name = 'Alex' and style = 'House')
order by sort limit 1;

-- 1c) az eredeti Lili/Alex sor stílusa és sorrendje biztosan helyes legyen
update mdschool.teachers set style = 'Koreográfia', sort = -40 where name = 'Lili' and style <> 'Girly';
update mdschool.teachers set style = 'Hip-Hop',      sort = -20 where name = 'Alex' and style <> 'House';

-- Eredmény sorrend: Lili-Koreográfia(-40), Lili-Girly(-30), Alex-Hip-Hop(-20),
-- Alex-House(-10), utánuk Dalma / Jayson / Oliver / Lia (sort = 0, név szerint).


-- ---------------------------------------------------------------------
--  2) HÍREK — upsert: ha a 'news' kulcsú sor már létezik, csak az items
--     tömböt cseréli (mint a v1), ha NEM létezik, most létrehozza a teljes
--     sort (ez hiányzott a v1-ből, ezért nem történt semmi).
-- ---------------------------------------------------------------------
insert into mdschool.settings (key, value)
values ('news', '{
  "title": "HÍREK ÉS\nESEMÉNYEK",
  "items": [
    {"imagePath": "", "alt": "Afro Collab Workshop – Október 24", "format": "landscape", "link": "https://hiphoptanciskola.com/50327-2/"},
    {"imagePath": "", "alt": "ACCESS 003 WORKSHOP – Shona Wilson (UK)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-003-workshop-shona-wilson-uk-%f0%9f%87%ac%f0%9f%87%a7/"},
    {"imagePath": "", "alt": "MD Afterdark Party", "format": "portrait", "link": "https://hiphoptanciskola.com/md-afterdark-party/"},
    {"imagePath": "", "alt": "ACCESS 004 WORKSHOP – Peter Valentin (ITA)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-003-workshop-peter-valentin-ita-%f0%9f%87%ae%f0%9f%87%b9/"},
    {"imagePath": "", "alt": "Új óratípus: Kezdő Commercial / Girly Class", "format": "landscape", "link": "https://hiphoptanciskola.com/uj-oratipus-kezdo-commercial-girly-classsz/"},
    {"imagePath": "", "alt": "Lia visszatér – Girly & High Heels péntekenként", "format": "portrait", "link": "https://hiphoptanciskola.com/lia-visszater-girly-high-heels-pentekenkent-%f0%9f%92%8b%f0%9f%91%a0/"},
    {"imagePath": "", "alt": "ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-workshop-october-3-bianca-torres-aponte-aaron-quini-us/"},
    {"imagePath": "", "alt": "Afro Dance Workshop – Jayson x Flexx", "format": "landscape", "link": "https://hiphoptanciskola.com/afro-dance-workshop-jayson-x-flexx/"},
    {"imagePath": "", "alt": "Dalma x Lili Collab Dance Workshop", "format": "landscape", "link": "https://hiphoptanciskola.com/dalma-x-lili-collab-dance-workshop/"}
  ]
}'::jsonb)
on conflict (key) do update
  set value = jsonb_set(coalesce(mdschool.settings.value, '{}'::jsonb), '{items}', excluded.value->'items'),
      updated_at = now();


-- ---------------------------------------------------------------------
--  ELLENŐRZÉS FUTTATÁS UTÁN
-- ---------------------------------------------------------------------
select name, style, sort from mdschool.teachers order by sort, name;
select jsonb_pretty(value) from mdschool.settings where key = 'news';
