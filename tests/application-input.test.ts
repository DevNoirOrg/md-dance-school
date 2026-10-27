import assert from "node:assert/strict";
import test from "node:test";
import { checkCampApplication, checkClassApplication } from "../lib/application-input.ts";
import { defaultSettings } from "../lib/defaults.ts";
import { ageFrom, classChip, classFull } from "../lib/format.ts";

const NOW = new Date("2026-10-23T12:00:00");
const CLASS_ID = "00000000-0000-4000-8000-000000000201";

const adult = {
  vezeteknev: "Kovács",
  keresztnev: "Emma",
  email: "emma@pelda.hu",
  szuletes: "1998-05-12",
  tapasztalat: "Nem",
  kezdes: "Ma",
  tajekoztato: true as const,
  adatkezeles: true as const,
  classIds: [CLASS_ID],
};

test("ageFrom: születésnap előtt / után", () => {
  assert.equal(ageFrom("2010-10-23", NOW), 16);
  assert.equal(ageFrom("2010-10-24", NOW), 15);
  assert.equal(ageFrom("", NOW), null);
  assert.equal(ageFrom("2010-13-45", NOW), null);
});

test("chip és teljes óraleírás", () => {
  assert.equal(classChip("Nagy", "Hétfő - Szerda", "18:30-20:00"), "Nagy · Hétfő – Szerda 18:30");
  assert.equal(classFull("Nagy terem", "Péntek", "16:00-17:30", "Hip-hop"), "Nagy terem · Péntek · 16:00-17:30 · Hip-hop");
});

test("órajelentkezés: felnőtt átmegy, a szülő adatai eldobódnak", () => {
  const r = checkClassApplication({ ...adult, szulo_nev: "X", szulo_email: "x@y.hu" }, defaultSettings.form_options, NOW);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.minor, false);
    assert.equal(r.data.szulo_nev, "");
  }
});

test("órajelentkezés: 16 év alatt kötelező a szülő neve és e-mailje", () => {
  const kid = { ...adult, szuletes: "2012-01-01" };
  assert.equal(checkClassApplication(kid, defaultSettings.form_options, NOW).ok, false);
  const r = checkClassApplication({ ...kid, szulo_nev: "Kovács Ákos", szulo_email: "akos@pelda.hu" }, defaultSettings.form_options, NOW);
  assert.ok(r.ok && r.data.minor);
});

test("órajelentkezés: hiányzó hozzájárulás, ismeretlen opció, óra nélkül → hiba", () => {
  const o = defaultSettings.form_options;
  assert.equal(checkClassApplication({ ...adult, adatkezeles: false }, o, NOW).ok, false);
  assert.equal(checkClassApplication({ ...adult, kezdes: "Tegnap" }, o, NOW).ok, false);
  assert.equal(checkClassApplication({ ...adult, classIds: [] }, o, NOW).ok, false);
  assert.equal(checkClassApplication({ ...adult, szuletes: "2030-01-01" }, o, NOW).ok, false);
});

const camper = {
  nev: "Kovács Emma",
  email: "szulo@pelda.hu",
  telefon: "+36 30 123 4567",
  szuletes: "2012-03-04",
  polo: "M",
  turnus: ["II"],
  fizetes: "Banki átutalás",
  honnan: "Instagram",
  kitolto: "Édesanya",
  tajekoztato: true as const,
  adatkezeles: true as const,
};

test("táborjelentkezés: érvényes adatok átmennek", () => {
  const r = checkCampApplication(camper, defaultSettings.camp, NOW);
  assert.ok(r.ok);
});

test("táborjelentkezés: lezárt turnus, rossz telefon, ismeretlen pólóméret → hiba", () => {
  const camp = defaultSettings.camp;
  assert.equal(checkCampApplication({ ...camper, turnus: ["I"] }, camp, NOW).ok, false);
  assert.equal(checkCampApplication({ ...camper, turnus: ["X"] }, camp, NOW).ok, false);
  assert.equal(checkCampApplication({ ...camper, telefon: "12" }, camp, NOW).ok, false);
  assert.equal(checkCampApplication({ ...camper, polo: "XXS" }, camp, NOW).ok, false);
  assert.equal(checkCampApplication({ ...camper, turnus: [] }, camp, NOW).ok, false);
});
