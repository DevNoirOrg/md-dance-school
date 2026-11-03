-- =====================================================================
--  MD Dance School — v4: órajelentkezési űrlap mezőinek átalakítása
--  (a doksi szerinti mezőlista alapján)
--
--  Változások:
--   - "Teljes név" egy mezőként jön a jövőben (nem vezetéknév/keresztnév
--     külön) — ÚJ `nev` oszlop, a régiekből összerakva (nem törli a régi
--     vezeteknev/keresztnev oszlopokat, csak kiegészíti).
--   - ÚJ `telefon` oszlop (kötelező mezővé vált az űrlapon).
--   - a `kezdes` ("Mikortól kezdenél?") mező megszűnt az űrlapon → az
--     oszlop NOT NULL kényszere felszabadítva (az oszlop megmarad, csak
--     nem kötelező többé — a régi sorok adatát nem bántja).
--   - a szülő neve/e-mailje már eddig is nullable volt — nincs vele dolog.
--
--  NEM destruktív: nem töröl oszlopot, nem töröl sort. `add column if not
--  exists` / `drop not null` — többször is futtatható.
-- =====================================================================

-- ---------------------------------------------------------------------
--  0) ELLENŐRZÉS FUTTATÁS ELŐTT — csak olvas.
-- ---------------------------------------------------------------------
select column_name, is_nullable, data_type
from information_schema.columns
where table_schema = 'mdschool' and table_name = 'applications'
order by ordinal_position;


-- ---------------------------------------------------------------------
--  1) ÚJ OSZLOPOK
-- ---------------------------------------------------------------------
alter table mdschool.applications add column if not exists nev text;
alter table mdschool.applications add column if not exists telefon text not null default '';

-- A régi sorok "nev" mezőjét a meglévő vezetéknév + keresztnév összerakásából töltjük fel
-- (a régi oszlopok megmaradnak, csak már nem ezeket használja az app).
update mdschool.applications
set nev = trim(coalesce(vezeteknev, '') || ' ' || coalesce(keresztnev, ''))
where nev is null;


-- ---------------------------------------------------------------------
--  2) "Mikortól kezdenél?" MEZŐ MEGSZŰNT — az oszlop kényszere felszabadítva
-- ---------------------------------------------------------------------
alter table mdschool.applications alter column kezdes drop not null;


-- ---------------------------------------------------------------------
--  ELLENŐRZÉS FUTTATÁS UTÁN
-- ---------------------------------------------------------------------
select id, nev, telefon, szulo_nev, szulo_email, kezdes from mdschool.applications order by created_at desc limit 20;
