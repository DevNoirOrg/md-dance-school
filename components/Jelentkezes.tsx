"use client";
import { motion, useInView } from "motion/react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Arak from "./Arak";
import { SelectionChip, useClassSelection } from "./ClassSelection";
import ConsentChecks, { consentErrors, emptyConsents, type Consents } from "./ConsentChecks";
import { ErrorBox, Field, Honeypot, inputCls, Select, SuccessIcon, SummaryRows } from "./FormBits";
import { submitClassApplication } from "@/app/actions/applications";
import type { FormOptions, PricesContent } from "@/lib/content-types";
import { ageFrom, EMAIL_RE, PARENT_REQUIRED_UNDER_AGE } from "@/lib/format";

/*
  Jelentkezési űrlap — az UC (Under Cover) oldal megoldása alapján, MD színekkel:
   - a kiválasztott órák az órarendből jönnek (chipek a form tetején)
   - 16 év alatt a szülő neve + e-mail címe kötelezővé válik
   - magyar nyelvű, mezőnkénti validáció (az első beküldés után élőben frissül)
   - beküldéskor az adatbázisba kerül (admin → Jelentkezések), és e-mail értesítés megy
*/

const empty = {
  vezeteknev: "",
  keresztnev: "",
  email: "",
  szuletes: "",
  szulo_nev: "",
  szulo_email: "",
  tapasztalat: "",
  kezdes: "",
  megjegyzes: "",
  website: "",
};
type Values = typeof empty;
type Key = keyof Values;

const ORDER = ["orak", "vezeteknev", "keresztnev", "email", "szuletes", "szulo_nev", "szulo_email", "tapasztalat", "kezdes", "tajekoztato", "adatkezeles"];

function validate(values: Values, minor: boolean, selectedCount: number) {
  const errors: Record<string, string> = {};
  if (selectedCount === 0) errors.orak = "Válassz legalább egy órát az órarendből!";
  const required: Key[] = ["vezeteknev", "keresztnev", "email", "szuletes", "tapasztalat", "kezdes"];
  if (minor) required.push("szulo_nev", "szulo_email");
  for (const k of required) {
    const v = values[k].trim();
    if (!v) {
      errors[k] = k === "tapasztalat" || k === "kezdes" ? "Válassz egy lehetőséget." : "Ezt a mezőt kötelező kitölteni.";
    } else if ((k === "email" || k === "szulo_email") && !EMAIL_RE.test(v)) {
      errors[k] = "Adj meg egy érvényes e-mail címet.";
    } else if (k === "szuletes") {
      const a = ageFrom(v);
      if (a === null) errors[k] = "Adj meg egy érvényes dátumot.";
      else if (a < 0) errors[k] = "A dátum a jövőben van.";
      else if (a > 100) errors[k] = "Ellenőrizd a megadott dátumot.";
    }
  }
  return errors;
}

export default function Jelentkezes({ prices, options }: { prices: PricesContent; options: FormOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { selected, remove, clear } = useClassSelection();

  const [values, setValues] = useState<Values>(empty);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [submitTried, setSubmitTried] = useState(false);
  const [summary, setSummary] = useState<[string, string][] | null>(null);
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");

  const age = ageFrom(values.szuletes);
  const minor = age !== null && age >= 0 && age < PARENT_REQUIRED_UNDER_AGE;

  const errors = useMemo<Record<string, string | undefined>>(
    () => ({ ...validate(values, minor, selected.length), ...consentErrors(consents) }),
    [values, minor, selected.length, consents],
  );
  // Hibát csak akkor mutatunk, ha a mezőhöz már hozzányúltak, vagy próbált beküldeni
  const shown = (k: Key) => (submitTried || touched[k] ? errors[k] : undefined);
  const errorCount = Object.keys(errors).length;

  const set = (k: Key) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [k]: v }));
  };
  const touch = (k: Key) => () => setTouched((prev) => ({ ...prev, [k]: true }));
  const cls = (k: Key, extra = "") => inputCls(shown(k), extra);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitTried(true);
    setServerError("");
    if (errorCount > 0) {
      // az első hibás helyre görgetünk
      const first = ORDER.find((k) => errors[k]);
      const el = document.getElementById(
        first === "orak" ? "form-selection" : first === "tajekoztato" || first === "adatkezeles" ? `jel-${first}-row` : `f-${first}`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const res = await submitClassApplication({
        ...values,
        szulo_nev: minor ? values.szulo_nev : "",
        szulo_email: minor ? values.szulo_email : "",
        tajekoztato: consents.tajekoztato as true,
        adatkezeles: consents.adatkezeles as true,
        classIds: selected.map((c) => c.id),
      });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
    } catch {
      setServerError("Nem sikerült elküldeni a jelentkezést. Ellenőrizd az internetkapcsolatot, és próbáld újra.");
      return;
    } finally {
      setSending(false);
    }

    const rows: [string, string][] = [
      ["Név", `${values.vezeteknev} ${values.keresztnev}`],
      ["E-mail", values.email],
      ["Születési dátum", values.szuletes],
    ];
    if (minor) rows.push(["Szülő", `${values.szulo_nev} · ${values.szulo_email}`]);
    rows.push(["Tánctapasztalat", values.tapasztalat], ["Kezdés", values.kezdes], ["Órák", selected.map((c) => c.full).join("\n")]);
    if (values.megjegyzes.trim()) rows.push(["Megjegyzés", values.megjegyzes]);
    setSummary(rows);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const restart = () => {
    setValues(empty);
    setTouched({});
    setSubmitTried(false);
    setSummary(null);
    setConsents(emptyConsents);
    clear();
    document.getElementById("orarend")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="jelentkezes" className="relative scroll-mt-12 bg-black px-4 pb-24 pt-28 sm:pt-40">
      {/* Űrlap balra, árak jobbra (mobilon egymás alatt) */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-x-8 gap-y-20 lg:grid-cols-[minmax(0,1fr)_360px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative scroll-mt-28 rounded-[2.5rem] bg-white px-5 pb-10 pt-16 shadow-2xl sm:px-12 sm:pb-12 sm:pt-20"
        >
          {/* Cím — kilóg a kártya tetejéből, fehér körvonallal */}
          <h2
            className="section-title absolute left-6 text-4xl leading-none sm:left-12 sm:text-5xl"
            style={{ top: "-0.5em", color: "#000", WebkitTextStroke: "7px #fff", paintOrder: "stroke" }}
          >
            JELENTKEZÉS
          </h2>

          {summary ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <SuccessIcon />
              <h3 className="mt-6 text-3xl font-black text-black">Köszönjük a jelentkezést!</h3>
              <p className="mt-3 text-sm font-semibold text-gray-500">Hamarosan keresünk a megadott e-mail címen.</p>
              <SummaryRows rows={summary} />
              <button
                type="button"
                onClick={restart}
                className="mt-8 text-[11px] font-extrabold uppercase tracking-widest text-[#1a9ea3] transition-colors hover:text-black"
              >
                Új jelentkezés indítása
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7" aria-busy={sending}>
              <Honeypot value={values.website} onChange={(v) => setValues((p) => ({ ...p, website: v }))} />

              {/* ---- Választott óráid ---- */}
              <div
                id="form-selection"
                className={`rounded-3xl border-2 p-6 transition-colors ${
                  submitTried && errors.orak ? "border-red-300 bg-red-50/60" : "border-md-cyan/40 bg-md-cyan/10"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-black">
                    Választott óráid <span className="text-[#1a9ea3]">*</span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/50">{selected.length} óra</span>
                </div>
                {selected.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.map((c) => (
                      <SelectionChip key={c.id} item={c} onRemove={remove} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-500">
                      Még nincs kiválasztott órád — legalább egyet válassz az órarendből.
                    </p>
                    <a
                      href="#orarend"
                      className="mt-3 inline-block rounded-xl bg-black px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-md-cyan hover:text-black"
                    >
                      Vissza az órarendhez
                    </a>
                  </div>
                )}
                {submitTried && errors.orak && <p className="mt-3 text-[13px] font-semibold text-red-600">{errors.orak}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="f-vezeteknev" label="Vezetéknév" required error={shown("vezeteknev")}>
                  <input id="f-vezeteknev" type="text" autoComplete="family-name" placeholder="Kovács" maxLength={100}
                    value={values.vezeteknev} onChange={set("vezeteknev")} onBlur={touch("vezeteknev")} className={cls("vezeteknev")} />
                </Field>
                <Field id="f-keresztnev" label="Keresztnév" required error={shown("keresztnev")}>
                  <input id="f-keresztnev" type="text" autoComplete="given-name" placeholder="Emma" maxLength={100}
                    value={values.keresztnev} onChange={set("keresztnev")} onBlur={touch("keresztnev")} className={cls("keresztnev")} />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="f-email" label="E-mail címed (Táncos)" required error={shown("email")}>
                  <input id="f-email" type="email" autoComplete="email" placeholder="hello@valami.hu" maxLength={200}
                    value={values.email} onChange={set("email")} onBlur={touch("email")} className={cls("email")} />
                </Field>
                <Field id="f-szuletes" label="Mikor születtél? (Táncos)" required error={shown("szuletes")}>
                  <input id="f-szuletes" type="date"
                    value={values.szuletes} onChange={set("szuletes")} onBlur={touch("szuletes")} className={cls("szuletes")} />
                </Field>
              </div>

              {/* ---- 16 év alatt: szülő adatai ---- */}
              {minor && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="rounded-2xl border-2 border-md-cyan/40 bg-md-cyan/10 px-6 py-4">
                    <p className="text-sm font-bold text-black">
                      {PARENT_REQUIRED_UNDER_AGE} év alatti vagy — kérjük, add meg a szülőd teljes nevét és e-mail címét!
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field id="f-szulo_nev" label="Szülő teljes neve" required error={shown("szulo_nev")}>
                      <input id="f-szulo_nev" type="text" placeholder="Kovács Ákos" maxLength={200}
                        value={values.szulo_nev} onChange={set("szulo_nev")} onBlur={touch("szulo_nev")} className={cls("szulo_nev")} />
                    </Field>
                    <Field id="f-szulo_email" label="Szülő e-mail címe" required error={shown("szulo_email")}>
                      <input id="f-szulo_email" type="email" placeholder="szulo@valami.hu" maxLength={200}
                        value={values.szulo_email} onChange={set("szulo_email")} onBlur={touch("szulo_email")} className={cls("szulo_email")} />
                    </Field>
                  </div>
                </motion.div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="f-tapasztalat" label="Táncoltál már korábban?" required error={shown("tapasztalat")}>
                  <Select id="f-tapasztalat" value={values.tapasztalat} onChange={set("tapasztalat")} onBlur={touch("tapasztalat")}
                    className={cls("tapasztalat")} options={options.experience} />
                </Field>
                <Field id="f-kezdes" label="Mikortól kezdenél?" required error={shown("kezdes")}>
                  <Select id="f-kezdes" value={values.kezdes} onChange={set("kezdes")} onBlur={touch("kezdes")}
                    className={cls("kezdes")} options={options.start} />
                </Field>
              </div>

              <Field id="f-megjegyzes" label="Megjegyzés">
                <textarea id="f-megjegyzes" rows={4} placeholder="Bármi, amit tudnunk érdemes…" maxLength={2000}
                  value={values.megjegyzes} onChange={set("megjegyzes")} className={cls("megjegyzes", "resize-none")} />
              </Field>

              <ConsentChecks
                idPrefix="jel"
                values={consents}
                onChange={(k, v) => setConsents((prev) => ({ ...prev, [k]: v }))}
                showErrors={submitTried}
              />

              {submitTried && errorCount > 0 && (
                <ErrorBox>
                  {errorCount === 1
                    ? "Egy mező még hiányzik vagy hibás."
                    : `${errorCount} mező még hiányzik vagy hibás. A pirossal jelölt helyeket javítsd!`}
                </ErrorBox>
              )}
              {serverError && <ErrorBox>{serverError}</ErrorBox>}

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-2xl bg-black py-5 text-sm font-extrabold uppercase tracking-[0.3em] text-white shadow-xl transition-colors duration-200 hover:bg-md-cyan hover:text-black disabled:cursor-wait disabled:opacity-60"
              >
                {sending ? "Küldés…" : "Jelentkezem"}
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> kötelező mező
              </p>
            </form>
          )}
        </motion.div>

        <Arak prices={prices} />
      </div>
    </section>
  );
}
