-- English translations for editable content and application language tracking.
alter table mdschool.rooms
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table mdschool.teachers
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table mdschool.news
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table mdschool.applications
  add column if not exists language text not null default 'hu';

alter table mdschool.camp_applications
  add column if not exists language text not null default 'hu';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'applications_language_check' and conrelid = 'mdschool.applications'::regclass) then
    alter table mdschool.applications add constraint applications_language_check check (language in ('hu', 'en'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'camp_applications_language_check' and conrelid = 'mdschool.camp_applications'::regclass) then
    alter table mdschool.camp_applications add constraint camp_applications_language_check check (language in ('hu', 'en'));
  end if;
end $$;
