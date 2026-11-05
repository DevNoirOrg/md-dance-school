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
import { t, type Locale } from "@/lib/i18n";

/*
  Jelentkezési űrlap — az UC (Under Cover) oldal megoldása alapján, MD színekkel:
   - a kiválasztott órák az órarendből jönnek (chipek a form tetején)
   - 16 év alatt a szülő neve + e-mail címe kötelezővé válik
   - magyar nyelvű, mezőnkénti validáció (az első beküldés után élőben frissül)
   - beküldéskor az adatbázisba kerül (admin → Jelentkezések), és e-mail értesítés megy
*/

const empty = {
  nev: "",
  email: "",
  telefon: "",
  szulo_nev: "",
  szulo_email: "",
  szuletes: "",
  tapasztalat: "",
  megjegyzes: "",
  website: "",
};
type Values = typeof empty;
type Key = keyof Values;

const ORDER = ["orak", "nev", "email", "telefon", "szuletes", "szulo_nev", "szulo_email", "tapasztalat", "tajekoztato", "adatkezeles"];

function validate(values: Values, selectedCount: number, locale: Locale) {
  const copy = t(locale).form;
  const errors: Record<string, string> = {};
  if (selectedCount === 0) errors.orak = copy.noClass;
  // A szülő neve/e-mailje NEM kötelező (16 év alatt is csak kérjük, nem követeljük).
  const required: Key[] = ["nev", "email", "telefon", "szuletes", "tapasztalat"];
  for (const k of required) {
    const v = values[k].trim();
    if (!v) {
      errors[k] = k === "tapasztalat" ? copy.optionError : copy.requiredError;
    } else if (k === "email" && !EMAIL_RE.test(v)) {
      errors[k] = copy.emailError;
    } else if (k === "szuletes") {
      const a = ageFrom(v);
      if (a === null) errors[k] = copy.dateError;
      else if (a < 0) errors[k] = copy.futureDate;
      else if (a > 100) errors[k] = copy.dateCheck;
    }
  }
  // A szülő e-mailje opcionális, de ha ki van töltve, legyen érvényes.
  const szuloEmail = values.szulo_email.trim();
  if (szuloEmail && !EMAIL_RE.test(szuloEmail)) errors.szulo_email = copy.parentEmailError;
  return errors;
}

export default function Jelentkezes({ prices, options, locale = "hu" }: { prices: PricesContent; options: FormOptions; locale?: Locale }) {
  const copy = t(locale).form;
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
    () => ({ ...validate(values, selected.length, locale), ...consentErrors(consents, locale) }),
    [values, selected.length, consents, locale],
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
        tajekoztato: consents.tajekoztato as true,
        adatkezeles: consents.adatkezeles as true,
        classIds: selected.map((c) => c.id),
        locale,
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
      [copy.summaryName, values.nev],
      [copy.summaryEmail, values.email],
      [copy.summaryPhone, values.telefon],
      [copy.summaryBirth, values.szuletes],
    ];
    if (values.szulo_nev.trim() || values.szulo_email.trim()) {
      rows.push([copy.summaryParent, [values.szulo_nev, values.szulo_email].filter((v) => v.trim()).join(" · ")]);
    }
    rows.push([copy.summaryExperience, values.tapasztalat], [copy.summaryClasses, selected.map((c) => c.full).join("\n")]);
    if (values.megjegyzes.trim()) rows.push([copy.summaryNote, values.megjegyzes]);
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
            {copy.title}
          </h2>

          {summary ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <SuccessIcon />
              <h3 className="mt-6 text-3xl font-black text-black">{copy.thanks}</h3>
              <p className="mt-3 text-sm font-semibold text-gray-500">{copy.confirmation}</p>
              <SummaryRows rows={summary} />
              <button
                type="button"
                onClick={restart}
                className="mt-8 text-[11px] font-extrabold uppercase tracking-widest text-[#1a9ea3] transition-colors hover:text-black"
              >
                {copy.restart}
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
                    {copy.selected} <span className="text-[#1a9ea3]">*</span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/50">{selected.length} {copy.classCount}</span>
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
                      {copy.noSelection}
                    </p>
                    <a
                      href="#orarend"
                      className="mt-3 inline-block rounded-xl bg-black px-5 py-3 text-[11px] font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-md-cyan hover:text-black"
                    >
                      {copy.backSchedule}
                    </a>
                  </div>
                )}
                {submitTried && errors.orak && <p className="mt-3 text-[13px] font-semibold text-red-600">{errors.orak}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="f-nev" label={copy.name} required error={shown("nev")}>
                  <input id="f-nev" type="text" autoComplete="name" placeholder="Kovács Emma" maxLength={200}
                    value={values.nev} onChange={set("nev")} onBlur={touch("nev")} className={cls("nev")} />
                </Field>
                <Field id="f-email" label={copy.email} required error={shown("email")}>
                  <input id="f-email" type="email" autoComplete="email" placeholder="hello@valami.hu" maxLength={200}
                    value={values.email} onChange={set("email")} onBlur={touch("email")} className={cls("email")} />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field id="f-telefon" label={copy.phone} required error={shown("telefon")}>
                  <input id="f-telefon" type="tel" autoComplete="tel" placeholder="+36 30 123 4567" maxLength={40}
                    value={values.telefon} onChange={set("telefon")} onBlur={touch("telefon")} className={cls("telefon")} />
                </Field>
                <Field id="f-szuletes" label={copy.birth} required error={shown("szuletes")}>
                  <input id="f-szuletes" type="date"
                    value={values.szuletes} onChange={set("szuletes")} onBlur={touch("szuletes")} className={cls("szuletes")} />
                </Field>
              </div>

              {/* ---- Szülő adatai — csak 16 év alatt jelenik meg (a születési dátum alapján), és NEM kötelező ---- */}
              {minor && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="rounded-2xl border-2 border-md-cyan/40 bg-md-cyan/10 px-6 py-4">
                    <p className="text-sm font-bold text-black">
                      {PARENT_REQUIRED_UNDER_AGE} {copy.parentNotice}
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field id="f-szulo_nev" label={copy.parentName} error={shown("szulo_nev")}>
                      <input id="f-szulo_nev" type="text" placeholder="Kovács Ákos" maxLength={200}
                        value={values.szulo_nev} onChange={set("szulo_nev")} onBlur={touch("szulo_nev")} className={cls("szulo_nev")} />
                    </Field>
                    <Field id="f-szulo_email" label={copy.parentEmail} error={shown("szulo_email")}>
                      <input id="f-szulo_email" type="email" placeholder="szulo@valami.hu" maxLength={200}
                        value={values.szulo_email} onChange={set("szulo_email")} onBlur={touch("szulo_email")} className={cls("szulo_email")} />
                    </Field>
                  </div>
                </motion.div>
              )}

              <Field id="f-tapasztalat" label={copy.experience} required error={shown("tapasztalat")}>
                <Select id="f-tapasztalat" value={values.tapasztalat} onChange={set("tapasztalat")} onBlur={touch("tapasztalat")} locale={locale}
                  className={cls("tapasztalat")} options={options.experience} />
              </Field>

              <Field id="f-megjegyzes" label={copy.note}>
                <textarea id="f-megjegyzes" rows={4} placeholder={copy.notePlaceholder} maxLength={2000}
                  value={values.megjegyzes} onChange={set("megjegyzes")} className={cls("megjegyzes", "resize-none")} />
              </Field>

              <ConsentChecks
                idPrefix="jel"
                locale={locale}
                values={consents}
                onChange={(k, v) => setConsents((prev) => ({ ...prev, [k]: v }))}
                showErrors={submitTried}
              />

              {submitTried && errorCount > 0 && (
                <ErrorBox>
                  {errorCount === 1
                    ? copy.submitErrorOne
                    : `${errorCount} ${copy.submitErrorMany}`}
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
                {sending ? copy.send : copy.submit}
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> {copy.required}
              </p>
            </form>
          )}
        </motion.div>

        <Arak prices={prices} />
      </div>
    </section>
  );
}
