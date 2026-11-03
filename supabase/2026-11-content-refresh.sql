-- =====================================================================
--  MD Dance School — tartalom-frissítés a Google Doc-os lista alapján
--  (tanárok duplikálása, valódi órarend, valódi hírek)
--
--  NEM destruktív a sémára nézve: nem töröl táblát, nem truncatel.
--  A tanár- és hír-rész pedig a sorokra nézve is additív / idempotens
--  (kétszer lefuttatva nem duplikál). Az órarend-rész SZÁNDÉKOSAN töröl
--  és újraír, de KIZÁRÓLAG a 2 megnevezett terem óráit — ez a lényege
--  (a helyőrző órákat kell lecserélni a valódira), lásd a 2) blokk elején
--  a kommentet.
--
--  Mielőtt futtatod: nézd meg a 0) blokk SELECT-jeinek eredményét, és
--  ellenőrizd, hogy a terem- és tanárnevek egyeznek a feltételezésekkel
--  (ld. kommentek). Ha nem, írd át a WHERE-eket futtatás előtt.
-- =====================================================================

-- ---------------------------------------------------------------------
--  0) ELLENŐRZÉS FUTTATÁS ELŐTT — csak olvas, nem módosít semmit.
-- ---------------------------------------------------------------------
select id, name, style, sort from mdschool.teachers order by sort, name;
select id, name, short_name, column_headings, sort from mdschool.rooms order by sort, name;
select key, jsonb_pretty(value) from mdschool.settings where key = 'news';


-- ---------------------------------------------------------------------
--  1) TANÁROK — Lili és Alex duplikálása külön kártyára (Girly / House),
--     és mind a négy kártya a lista elejére kerül.
--     A fotót és az Insta-linket a meglévő sorból másolja át a script,
--     így nem kell újra feltölteni semmit.
--     Idempotens: ha a Girly/House kártya már létezik, nem csinál semmit.
-- ---------------------------------------------------------------------
insert into mdschool.teachers (name, style, image_path, video_url, sort)
select name, 'Girly', image_path, video_url, -30
from mdschool.teachers
where name = 'Lili'
  and not exists (select 1 from mdschool.teachers where name = 'Lili' and style = 'Girly')
limit 1;

insert into mdschool.teachers (name, style, image_path, video_url, sort)
select name, 'House', image_path, video_url, -10
from mdschool.teachers
where name = 'Alex'
  and not exists (select 1 from mdschool.teachers where name = 'Alex' and style = 'House')
limit 1;

-- Az eredeti Lili / Alex sor stílusa szűkül Koreográfiára / Hip-Hopra
-- (a Girly / House immár külön kártyán van), és előre kerülnek a sorban.
update mdschool.teachers set style = 'Koreográfia', sort = -40
where name = 'Lili' and style <> 'Girly';

update mdschool.teachers set style = 'Hip-Hop', sort = -20
where name = 'Alex' and style <> 'House';

-- Eredmény sorrend (sort, name szerint nő): Lili-Koreográfia(-40), Lili-Girly(-30),
-- Alex-Hip-Hop(-20), Alex-House(-10), utánuk a többi tanár (sort = 0).


-- ---------------------------------------------------------------------
--  2) ÓRAREND — a két Astoria terem helyőrző óráinak lecserélése a
--     hiphoptanciskola.com/orarend/ valódi, aktuális óráira (2026-11-02-i
--     állapot — ha változott, szólj és frissítem).
--
--     FELTÉTELEZÉS: a nagy terem neve tartalmazza "nagy"-ot, a kis terem
--     neve "kis"-t (kis/nagybetű-független). Ha a 0) blokk SELECT-je
--     mást mutat, itt a room_id lekérdezést kézzel kell igazítani.
--
--     Csak ennek a 2 teremnek a classes-sorait törli és írja újra —
--     más termet / más adatot nem érint.
-- ---------------------------------------------------------------------
do $$
declare
  big_room  uuid;
  small_room uuid;
begin
  select id into big_room   from mdschool.rooms where name ilike '%nagy%' order by sort, name limit 1;
  select id into small_room from mdschool.rooms where name ilike '%kis%'  order by sort, name limit 1;

  if big_room is null or small_room is null then
    raise exception 'Nem találom a nagy/kis termet név alapján — nézd meg a 0) blokk SELECT eredményét, és igazítsd a WHERE-t.';
  end if;

  -- a column_headings legyen a valós napcsoportosítás (ha még nem az)
  update mdschool.rooms set column_headings = array['Hétfő - Szerda', 'Kedd - Csütörtök', 'Péntek'] where id in (big_room, small_room);

  delete from mdschool.classes where room_id in (big_room, small_room);

  -- Nagy terem — Hétfő-Szerda (col 0)
  insert into mdschool.classes (room_id, col, sort, time, title) values
    (big_room, 0, 0, '16:00-17:00', 'Kezdő Tini Koreográfia (12+) – Lili'),
    (big_room, 0, 1, '17:00-18:00', 'Kezdő Tini Hip-Hop (12+) – Dalma'),
    (big_room, 0, 2, '18:00-19:00', 'Közép-haladó Koreográfia – Lili'),
    (big_room, 0, 3, '19:00-20:00', 'Közép-haladó Hip-Hop – Dalma'),
    (big_room, 0, 4, '20:00-21:00', 'I. Kezdő Felnőtt Hip-Hop – Alex');

  -- Nagy terem — Kedd-Csütörtök (col 1)
  insert into mdschool.classes (room_id, col, sort, time, title) values
    (big_room, 1, 0, '16:00-17:00', 'Kezdő Tini Hip-Hop (12+) – Alex'),
    (big_room, 1, 1, '17:00-18:00', 'Közép-Haladó Hip-Hop – Alex'),
    (big_room, 1, 2, '18:00-19:00', 'Kezdő Commercial / Girly Class – Lili'),
    (big_room, 1, 3, '19:00-20:00', 'Kezdő Felnőtt Koreográfia (18+) – Lili'),
    (big_room, 1, 4, '20:00-21:00', 'II. Kezdő Felnőtt Hip-Hop (18+) – Alex');

  -- Nagy terem — Péntek (col 2)
  insert into mdschool.classes (room_id, col, sort, time, title) values
    (big_room, 2, 0, '17:00-18:00', 'Kezdő Girly Dance Class – Lia'),
    (big_room, 2, 1, '18:00-19:30', 'Közép-haladó Girly Dance Class (16+) – Lili'),
    (big_room, 2, 2, '19:30-21:00', 'Open Level – High Heels – Lia');

  -- Kis terem — Hétfő-Szerda (col 0)
  insert into mdschool.classes (room_id, col, sort, time, title) values
    (small_room, 0, 0, '18:00-19:00', 'Beginner Afro Fusion – Jayson'),
    (small_room, 0, 1, '19:00-20:00', 'Open Level House – Alex'),
    (small_room, 0, 2, '20:00-21:00', 'Afro Fusion – Open Class – Jayson');

  -- Kis terem — Kedd-Csütörtök (col 1)
  insert into mdschool.classes (room_id, col, sort, time, title) values
    (small_room, 1, 0, '18:00-19:00', 'Kezdő Koreográfia – Olivér'),
    (small_room, 1, 1, '19:00-20:00', 'Közép-Haladó Felnőtt Hip-Hop – Alex'),
    (small_room, 1, 2, '20:00-21:00', 'Közép-Haladó Koreográfia – Olivér');

  -- Kis terem — Péntek: nincs óra a valódi oldalon, így ide szándékosan
  -- nem kerül semmi (üres oszlop marad, ahogy a régi oldalon is).
end $$;


-- ---------------------------------------------------------------------
--  3) HÍREK — a 4 régi helyőrző cserélődik a hiphoptanciskola.com
--     /kategoria/hirek/ 9 valódi, aktuális hírére (cím + link).
--     A doksi szerint "elég a szövegeket" most pótolni — a képeket
--     később küldik, ezért image_path most placeholder marad, amit
--     az adminban (Hírek menü) kell majd feltölteni képpel.
--     Teljesen felülírja a 'news' kulcs items tömbjét (a cím/kulcs
--     maga megmarad, csak az items cserélődik).
-- ---------------------------------------------------------------------
update mdschool.settings
set value = jsonb_set(
  value,
  '{items}',
  '[
    {"imagePath": "", "alt": "Afro Collab Workshop – Október 24", "format": "landscape", "link": "https://hiphoptanciskola.com/50327-2/"},
    {"imagePath": "", "alt": "ACCESS 003 WORKSHOP – Shona Wilson (UK)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-003-workshop-shona-wilson-uk-%f0%9f%87%ac%f0%9f%87%a7/"},
    {"imagePath": "", "alt": "MD Afterdark Party", "format": "portrait", "link": "https://hiphoptanciskola.com/md-afterdark-party/"},
    {"imagePath": "", "alt": "ACCESS 004 WORKSHOP – Peter Valentin (ITA)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-003-workshop-peter-valentin-ita-%f0%9f%87%ae%f0%9f%87%b9/"},
    {"imagePath": "", "alt": "Új óratípus: Kezdő Commercial / Girly Class", "format": "landscape", "link": "https://hiphoptanciskola.com/uj-oratipus-kezdo-commercial-girly-classsz/"},
    {"imagePath": "", "alt": "Lia visszatér – Girly & High Heels péntekenként", "format": "portrait", "link": "https://hiphoptanciskola.com/lia-visszater-girly-high-heels-pentekenkent-%f0%9f%92%8b%f0%9f%91%a0/"},
    {"imagePath": "", "alt": "ACCESS Workshop – Bianca Torres-Aponte & Aaron Quini (US)", "format": "landscape", "link": "https://hiphoptanciskola.com/access-workshop-october-3-bianca-torres-aponte-aaron-quini-us/"},
    {"imagePath": "", "alt": "Afro Dance Workshop – Jayson x Flexx", "format": "landscape", "link": "https://hiphoptanciskola.com/afro-dance-workshop-jayson-x-flexx/"},
    {"imagePath": "", "alt": "Dalma x Lili Collab Dance Workshop", "format": "landscape", "link": "https://hiphoptanciskola.com/dalma-x-lili-collab-dance-workshop/"}
  ]'::jsonb
)
where key = 'news';


-- ---------------------------------------------------------------------
--  ELLENŐRZÉS FUTTATÁS UTÁN
-- ---------------------------------------------------------------------
select id, name, style, sort from mdschool.teachers order by sort, name;
select r.name, c.col, c.sort, c.time, c.title
from mdschool.classes c join mdschool.rooms r on r.id = c.room_id
order by r.name, c.col, c.sort;
select jsonb_pretty(value) from mdschool.settings where key = 'news';
