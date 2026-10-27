import { z } from "zod";
import { ageFrom, EMAIL_RE, PARENT_REQUIRED_UNDER_AGE } from "./format.ts";

/*
  A két publikus jelentkezési űrlap (órák, tánctábor) szerveroldali ellenőrzése.
  Tiszta függvények (nincs adatbázis) — a Server Action és a tesztek is ezt használják.
  A böngészős ellenőrzés csak kényelmi funkció; ami számít, az ez.
*/

const PHONE_RE = /^\+?[\d\s\-()/]+$/;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// ---------------------------------------------------------------------
//  Órajelentkezés
// ---------------------------------------------------------------------
export const classApplicationSchema = z.object({
  vezeteknev: z.string().trim().min(1).max(100),
  keresztnev: z.string().trim().min(1).max(100),
  email: z.string().trim().max(200).regex(EMAIL_RE),
  szuletes: date,
  szulo_nev: z.string().trim().max(200).optional().default(""),
  szulo_email: z.string().trim().max(200).optional().default(""),
  tapasztalat: z.string().trim().min(1).max(100),
  kezdes: z.string().trim().min(1).max(100),
  megjegyzes: z.string().trim().max(2000).optional().default(""),
  /** „Elolvastam és elfogadom az Adatkezelési tájékoztatóban foglaltakat.” */
  tajekoztato: z.literal(true),
  /** „Hozzájárulok a fenti adataim Adatkezelő által történő kezeléséhez.” */
  adatkezeles: z.literal(true),
  classIds: z.array(z.string().uuid()).min(1).max(30),
  /** Rejtett csapdamező — ember nem tölti ki. */
  website: z.string().optional().default(""),
});
export type ClassApplicationInput = z.input<typeof classApplicationSchema>;
export type ClassApplicationData = z.output<typeof classApplicationSchema> & { minor: boolean };

export function checkClassApplication(
  raw: unknown,
  options: { experience: string[]; start: string[] },
  now?: Date,
): { ok: true; data: ClassApplicationData } | { ok: false; error: string } {
  const parsed = classApplicationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Valamelyik mező hibás. Ellenőrizd az adatokat, és próbáld újra." };
  const input = parsed.data;
  const age = ageFrom(input.szuletes, now);
  if (age === null || age < 0 || age > 100) return { ok: false, error: "Ellenőrizd a születési dátumot." };
  const minor = age < PARENT_REQUIRED_UNDER_AGE;
  if (minor && (!input.szulo_nev || !EMAIL_RE.test(input.szulo_email))) {
    return { ok: false, error: `${PARENT_REQUIRED_UNDER_AGE} év alatt add meg a szülőd nevét és e-mail címét.` };
  }
  if (!options.experience.includes(input.tapasztalat) || !options.start.includes(input.kezdes)) {
    return { ok: false, error: "Valamelyik választott lehetőség már nem érvényes. Töltsd újra az oldalt." };
  }
  return {
    ok: true,
    data: { ...input, minor, szulo_nev: minor ? input.szulo_nev : "", szulo_email: minor ? input.szulo_email : "" },
  };
}

// ---------------------------------------------------------------------
//  Tánctábor-jelentkezés
// ---------------------------------------------------------------------
export const campApplicationSchema = z.object({
  nev: z.string().trim().min(1).max(200),
  email: z.string().trim().max(200).regex(EMAIL_RE),
  telefon: z
    .string()
    .trim()
    .max(40)
    .regex(PHONE_RE)
    .refine((v) => v.replace(/\D/g, "").length >= 7),
  szuletes: date,
  polo: z.string().trim().max(20),
  tudnivalo: z.string().trim().max(2000).optional().default(""),
  szulo_nev: z.string().trim().max(200).optional().default(""),
  szulo_telefon: z.string().trim().max(40).optional().default(""),
  lakcim: z.string().trim().max(300).optional().default(""),
  turnus: z.array(z.string().trim().min(1).max(20)).min(1).max(10),
  fizetes: z.string().trim().max(100),
  honnan: z.string().trim().max(100),
  kitolto: z.string().trim().max(100),
  tajekoztato: z.literal(true),
  adatkezeles: z.literal(true),
  website: z.string().optional().default(""),
});
export type CampApplicationInput = z.input<typeof campApplicationSchema>;
export type CampApplicationData = z.output<typeof campApplicationSchema>;

export function checkCampApplication(
  raw: unknown,
  camp: {
    turnusok: { id: string; closed: boolean }[];
    form: { shirtSizes: string[]; payments: string[]; sources: string[]; fillers: string[] };
  },
  now?: Date,
): { ok: true; data: CampApplicationData } | { ok: false; error: string } {
  const parsed = campApplicationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Valamelyik mező hibás. Ellenőrizd az adatokat, és próbáld újra." };
  const input = parsed.data;
  const age = ageFrom(input.szuletes, now);
  if (age === null || age < 0 || age > 100) return { ok: false, error: "Ellenőrizd a születési dátumot." };
  const open = new Set(camp.turnusok.filter((t) => !t.closed).map((t) => t.id));
  if (!input.turnus.every((t) => open.has(t))) {
    return { ok: false, error: "A választott turnus már nem elérhető. Töltsd újra az oldalt, és válassz újra." };
  }
  const f = camp.form;
  if (
    !f.shirtSizes.includes(input.polo) ||
    !f.payments.includes(input.fizetes) ||
    !f.sources.includes(input.honnan) ||
    !f.fillers.includes(input.kitolto)
  ) {
    return { ok: false, error: "Valamelyik választott lehetőség már nem érvényes. Töltsd újra az oldalt." };
  }
  if (input.szulo_telefon && !PHONE_RE.test(input.szulo_telefon)) {
    return { ok: false, error: "Ellenőrizd a szülő telefonszámát." };
  }
  return { ok: true, data: input };
}
