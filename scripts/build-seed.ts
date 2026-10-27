/*
  Elkészíti a supabase/mdschool-seed.sql fájlt a lib/defaults.ts tartalmából
  (a jelenlegi oldal szövegei, árai, órarendje, tanárai).
    npm run seed:sql
  A seed csak az ÜRES táblákat / hiányzó beállításokat tölti fel, a meglévő
  (adminban szerkesztett) tartalmat nem írja felül.
*/
import { writeFileSync } from "node:fs";
import { defaultRawRooms, defaultSettings, defaultTeachers } from "../lib/defaults.ts";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (xs: string[]) => `array[${xs.map(q).join(", ")}]::text[]`;
const dollar = (s: string) => {
  let tag = "j";
  while (s.includes(`$${tag}$`)) tag += "j";
  return `$${tag}$${s}$${tag}$`;
};

const out: string[] = [
  "-- =====================================================================",
  "--  MD Dance School — kezdő tartalom (a jelenlegi oldal tartalma).",
  "--  GENERÁLT FÁJL: npm run seed:sql (forrás: lib/defaults.ts).",
  "--  Futtasd a mdschool.sql UTÁN. Csak üres táblákat / hiányzó",
  "--  beállításokat tölt fel — a már szerkesztett tartalmat nem írja felül.",
  "--",
  "--  FONTOS: az utolsó sorban add meg a saját admin e-mail címed!",
  "-- =====================================================================",
  "",
  "begin;",
  "",
  "-- Beállítások (JSON)",
];
for (const [key, value] of Object.entries(defaultSettings)) {
  out.push(
    `insert into mdschool.settings (key, value) values (${q(key)}, ${dollar(JSON.stringify(value))}::jsonb) on conflict (key) do nothing;`,
  );
}

out.push("", "-- Órarend (csak ha még nincs terem)", "do $$", "begin", "  if not exists (select 1 from mdschool.rooms) then");
defaultRawRooms.forEach((room, sort) => {
  out.push(
    `    insert into mdschool.rooms (id, name, short_name, column_headings, sort) values (${q(room.id)}, ${q(room.name)}, ${q(room.shortName)}, ${arr(room.columns.map((c) => c.heading))}, ${sort});`,
  );
  room.columns.forEach((col, ci) =>
    col.classes.forEach((c, i) =>
      out.push(
        `    insert into mdschool.classes (id, room_id, col, sort, time, title) values (${q(c.id)}, ${q(room.id)}, ${ci}, ${i}, ${q(c.time)}, ${q(c.title)});`,
      ),
    ),
  );
});
out.push("  end if;", "end $$;", "");

out.push("-- Tanárok (csak ha még nincs tanár)", "do $$", "begin", "  if not exists (select 1 from mdschool.teachers) then");
defaultTeachers.forEach((t, sort) =>
  out.push(
    `    insert into mdschool.teachers (id, name, style, image_path, video_url, sort) values (${q(t.id)}, ${q(t.name)}, ${q(t.style)}, ${q(t.imagePath)}, ${q(t.videoUrl)}, ${sort});`,
  ),
);
out.push("  end if;", "end $$;", "");

out.push(
  "-- Első admin — CSERÉLD a saját e-mail címedre (kisbetűvel)!",
  "insert into mdschool.admins (email) values ('masterdancetanciskola@gmail.com') on conflict do nothing;",
  "",
  "commit;",
  "",
);

writeFileSync(new URL("../supabase/mdschool-seed.sql", import.meta.url), out.join("\n"));
console.log("supabase/mdschool-seed.sql elkészült.");
