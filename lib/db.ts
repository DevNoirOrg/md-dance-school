import "server-only";
import postgres from "postgres";

/*
  Közvetlen Postgres-kapcsolat (közös Supabase projekt, `mdschool` séma).
  Vercelen a Supabase "Transaction pooler" connection stringjét használd
  (6543-as port) — ezért van kikapcsolva a prepared statement (prepare: false).
*/

type Sql = ReturnType<typeof postgres>;
const globalForSql = globalThis as unknown as { __mdSchoolSql?: Sql };

/** Van-e adatbázis beállítva? Nélküle a publikus oldal a lib/defaults.ts tartalmát mutatja. */
export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

function createSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Hiányzik a DATABASE_URL környezeti változó (lásd README → Beállítás).");
  }
  return postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    // a dátumokat szövegként kérjük (pl. "2026-05-12"), ne JS Date-ként
    types: { date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x } },
  });
}

/** Lusta inicializálás: csak az első lekérdezéskor kapcsolódik. */
export function db(): Sql {
  if (!globalForSql.__mdSchoolSql) globalForSql.__mdSchoolSql = createSql();
  return globalForSql.__mdSchoolSql;
}
