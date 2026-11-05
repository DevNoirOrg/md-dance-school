import { z } from "zod";
import { ageFrom, EMAIL_RE, PARENT_REQUIRED_UNDER_AGE } from "./format.ts";
import { t, type Locale } from "./i18n.ts";

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
  locale: z.enum(["hu", "en"]).optional().default("hu"),
  nev: z.string().trim().min(1).max(200),
  email: z.string().trim().max(200).regex(EMAIL_RE),
  telefon: z
    .string()
    .trim()
    .max(40)
    .regex(PHONE_RE)
    .refine((v) => v.replace(/\D/g, "").length >= 7),
  szuletes: date,
  /** Csak 16 év alatt kérjük, de NEM kötelező (a szülő pótolhatja később is). */
  szulo_nev: z.string().trim().max(200).optional().default(""),
  szulo_email: z.string().trim().max(200).optional().default(""),
  tapasztalat: z.string().trim().min(1).max(100),
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
  options: { experience: string[] },
  now?: Date,
): { ok: true; data: ClassApplicationData } | { ok: false; error: string } {
  const locale: Locale =
    typeof raw === "object" && raw !== null && "locale" in raw && raw.locale === "en" ? "en" : "hu";
  const copy = t(locale).form;
  const parsed = classApplicationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: copy.invalidFields };
  const input = parsed.data;
  const age = ageFrom(input.szuletes, now);
  if (age === null || age < 0 || age > 100) return { ok: false, error: copy.dateCheck };
  const minor = age < PARENT_REQUIRED_UNDER_AGE;
  // A szülő neve/e-mailje NEM kötelező (sem kiskorúnál) — de ha megadták az e-mailt, legyen érvényes.
  if (input.szulo_email && !EMAIL_RE.test(input.szulo_email)) {
    return { ok: false, error: copy.parentEmailError };
  }
  if (!options.experience.includes(input.tapasztalat)) {
    return { ok: false, error: copy.optionError };
  }
  return { ok: true, data: { ...input, minor } };
}

// ---------------------------------------------------------------------
//  Tánctábor-jelentkezés
// ---------------------------------------------------------------------
export const campApplicationSchema = z.object({
  locale: z.enum(["hu", "en"]).optional().default("hu"),
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
  const locale: Locale =
    typeof raw === "object" && raw !== null && "locale" in raw && raw.locale === "en" ? "en" : "hu";
  const copy = t(locale).camp;
  const parsed = campApplicationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: copy.invalidFields };
  const input = parsed.data;
  const age = ageFrom(input.szuletes, now);
  if (age === null || age < 0 || age > 100) return { ok: false, error: copy.errDate };
  const open = new Set(camp.turnusok.filter((t) => !t.closed).map((t) => t.id));
  if (!input.turnus.every((t) => open.has(t))) {
    return { ok: false, error: copy.sessionUnavailable };
  }
  const f = camp.form;
  if (
    !f.shirtSizes.includes(input.polo) ||
    !f.payments.includes(input.fizetes) ||
    !f.sources.includes(input.honnan) ||
    !f.fillers.includes(input.kitolto)
  ) {
    return { ok: false, error: copy.optionUnavailable };
  }
  if (input.szulo_telefon && !PHONE_RE.test(input.szulo_telefon)) {
    return { ok: false, error: copy.parentPhoneCheck };
  }
  return { ok: true, data: input };
}
