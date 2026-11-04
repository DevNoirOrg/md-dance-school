"use client";
import { motion, useInView } from "motion/react";
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { CheckMark } from "../ConsentChecks";
import { ErrorBox, Honeypot, inputCls, SuccessIcon, SummaryRows } from "../FormBits";
import { submitCampApplication } from "@/app/actions/applications";
import type { CampContent } from "@/lib/content-types";
import { EMAIL_RE } from "@/lib/format";
import { PRIVACY_URL } from "@/lib/privacy";
import { t, type Locale } from "@/lib/i18n";

/*
  Tánctábor jelentkezési űrlap — a főoldali jelentkezés stílusában.
  Beküldéskor az adatbázisba kerül (admin → Jelentkezések → Tánctábor), és e-mail értesítés megy.
  A választható lehetőségek (turnusok, pólóméretek, fizetési módok…) az adminban szerkeszthetők.
*/

type Values = {
  nev: string;
  email: string;
  telefon: string;
  szuletes: string;
  polo: string;
  tudnivalo: string;
  szulo_nev: string;
  szulo_telefon: string;
  lakcim: string;
  turnus: string[];
  fizetes: string;
  honnan: string;
  kitolto: string;
  adatkezeles: boolean;
  hozzajarulas: boolean;
  website: string;
};

const emptyFor = (camp: CampContent): Values => ({
  nev: "",
  email: "",
  telefon: "",
  szuletes: "",
  polo: camp.form.shirtSizes[0] ?? "",
  tudnivalo: "",
  szulo_nev: "",
  szulo_telefon: "",
  lakcim: "",
  turnus: [],
  fizetes: camp.form.payments[0] ?? "",
  honnan: camp.form.sources[0] ?? "",
  kitolto: camp.form.fillers[0] ?? "",
  adatkezeles: false,
  hozzajarulas: false,
  website: "",
});

function validate(v: Values, locale: Locale) {
  const copy = t(locale).camp;
  const e: Record<string, string> = {};
  if (!v.nev.trim()) e.nev = copy.errName;
  if (!v.email.trim()) e.email = copy.errEmail;
  else if (!EMAIL_RE.test(v.email.trim())) e.email = copy.invalidEmail;
  if (!v.telefon.trim()) e.telefon = copy.errPhone;
  else if (!/^\+?[\d\s\-()/]+$/.test(v.telefon.trim()) || v.telefon.replace(/\D/g, "").length < 7)
    e.telefon = copy.phoneCheck;
  if (!v.szuletes) e.szuletes = copy.errDate;
  else if (new Date(v.szuletes) > new Date()) e.szuletes = copy.errFuture;
  if (v.turnus.length === 0) e.turnus = copy.errTurn;
  if (!v.adatkezeles) e.adatkezeles = copy.errPrivacy;
  if (!v.hozzajarulas) e.hozzajarulas = copy.errConsent;
  return e;
}

const ORDER = ["nev", "email", "telefon", "szuletes", "turnus", "adatkezeles", "hozzajarulas"];

function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2.5 ml-3 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
      {children} {required && <span className="text-[#1a9ea3]">*</span>}
    </label>
  );
}

function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="ml-3 mt-2 text-[13px] font-semibold text-red-600">{children}</p>;
}

// Választható „chip”-ek (rádiógomb-csoport helyett)
function ChipGroup({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-3 ml-3 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <label
              key={o}
              className={`cursor-pointer select-none rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                on ? "border-md-cyan bg-md-cyan text-black" : "border-gray-200 bg-white text-gray-700 hover:border-black"
              }`}
            >
              <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="sr-only" />
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckBox({
  id,
  checked,
  onChange,
  children,
  error,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  error?: unknown;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-md-cyan/40 ${
          checked ? "border-md-cyan bg-md-cyan" : error ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
        }`}
      >
        {checked && <CheckMark />}
      </span>
      <span className="text-[15px] font-semibold leading-snug text-black">{children}</span>
    </label>
  );
}

export default function TaborJelentkezes({ camp, locale = "hu" }: { camp: CampContent; locale?: Locale }) {
  const copy = t(locale).camp;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState<Values>(() => emptyFor(camp));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitTried, setSubmitTried] = useState(false);
  const [summary, setSummary] = useState<[string, string][] | null>(null);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = useMemo(() => validate(v, locale), [v, locale]);
  const errorCount = Object.keys(errors).length;
  const shown = (k: string) => (submitTried || touched[k] ? errors[k] : undefined);

  type TextKey = "nev" | "email" | "telefon" | "szuletes" | "tudnivalo" | "szulo_nev" | "szulo_telefon" | "lakcim";
  const set = (k: TextKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const setVal = (k: "polo" | "fizetes" | "honnan" | "kitolto") => (val: string) => setV((p) => ({ ...p, [k]: val }));
  const touch = (k: string) => () => setTouched((p) => ({ ...p, [k]: true }));
  const cls = (k: string, extra = "") => inputCls(shown(k), extra);

  const toggleTurnus = (id: string) =>
    setV((p) => ({ ...p, turnus: p.turnus.includes(id) ? p.turnus.filter((x) => x !== id) : [...p.turnus, id] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitTried(true);
    setServerError("");
    if (errorCount > 0) {
      const first = ORDER.find((k) => errors[k]);
      document.getElementById(`t-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const { adatkezeles, hozzajarulas, ...rest } = v;
      const res = await submitCampApplication({ ...rest, locale, tajekoztato: adatkezeles as true, adatkezeles: hozzajarulas as true });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
    } catch {
      setServerError(copy.sendError);
      return;
    } finally {
      setSending(false);
    }

    const turnusText = camp.turnusok
      .filter((t) => v.turnus.includes(t.id))
      .map((t) => `${t.label} (${t.dates})`)
      .join(", ");
    const rows: [string, string][] = [
      [copy.resident, v.nev],
      [copy.contactEmail, v.email],
      [copy.phoneLabel, v.telefon],
      [copy.birth, v.szuletes],
      [copy.shirt, v.polo],
      [copy.turn, turnusText],
      [copy.payment, v.fizetes],
    ];
    if (v.szulo_nev.trim() || v.szulo_telefon.trim())
      rows.push([copy.parent, [v.szulo_nev, v.szulo_telefon].filter(Boolean).join(" · ")]);
    if (v.lakcim.trim()) rows.push([copy.address, v.lakcim]);
    if (v.tudnivalo.trim()) rows.push([copy.importantNote, v.tudnivalo]);
    rows.push([copy.source, v.honnan], [copy.filler, v.kitolto]);
    setSummary(rows);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const restart = () => {
    setV(emptyFor(camp));
    setTouched({});
    setSubmitTried(false);
    setSummary(null);
  };

  return (
    <section id="jelentkezes" className="relative scroll-mt-12 bg-black px-4 pb-24 pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative mt-6 scroll-mt-28 rounded-[2.5rem] bg-white px-5 pb-10 pt-16 shadow-2xl sm:px-12 sm:pb-12 sm:pt-20"
        >
          {/* Cím — kilóg a kártya tetejéből, fehér körvonallal (mint a főoldalon) */}
          <h2
            className="section-title absolute left-6 text-4xl leading-none sm:left-12 sm:text-5xl"
            style={{ top: "-0.5em", color: "#000", WebkitTextStroke: "7px #fff", paintOrder: "stroke" }}
          >
            {copy.heading}
          </h2>

          {summary ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <SuccessIcon />
              <h3 className="mt-6 text-3xl font-black text-black">{copy.thanks}</h3>
              <p className="mt-3 text-sm font-semibold text-gray-500">
                {copy.confirmation}
              </p>
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
              <Honeypot value={v.website} onChange={(website) => setV((p) => ({ ...p, website }))} />

              {/* ---- Turnus ---- */}
              <div
                id="t-turnus"
                className={`rounded-3xl border-2 p-6 transition-colors ${
                  submitTried && errors.turnus ? "border-red-300 bg-red-50/60" : "border-md-cyan/40 bg-md-cyan/10"
                }`}
              >
                <div className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-black">
                  {copy.turn} <span className="text-[#1a9ea3]">*</span>
                </div>
                <div className="space-y-3">
                  {camp.turnusok.map((t) => (
                    <CheckBox key={t.id} id={`turnus-${t.id}`} checked={v.turnus.includes(t.id)} onChange={() => toggleTurnus(t.id)} disabled={t.closed}>
                      {t.label} · {t.dates} ({t.days})
                      {t.closed && <span className="ml-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">{copy.closed}</span>}
                    </CheckBox>
                  ))}
                </div>
                {submitTried && <ErrorText>{errors.turnus}</ErrorText>}
              </div>

              <div>
                <Label htmlFor="t-nev" required>
                  {copy.resident}
                </Label>
                <input id="t-nev" type="text" autoComplete="name" placeholder={copy.namePlaceholder} maxLength={200}
                  value={v.nev} onChange={set("nev")} onBlur={touch("nev")} className={cls("nev")} />
                <ErrorText>{shown("nev")}</ErrorText>
              </div>

              <div>
                <Label htmlFor="t-email" required>{copy.contactEmail}</Label>
                <input id="t-email" type="email" autoComplete="email" placeholder={copy.emailPlaceholder} maxLength={200}
                  value={v.email} onChange={set("email")} onBlur={touch("email")} className={cls("email")} />
                <ErrorText>{shown("email")}</ErrorText>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="t-telefon" required>
                    {copy.phoneLabel}
                  </Label>
                  <input id="t-telefon" type="tel" autoComplete="tel" placeholder="+36 30 123 4567" maxLength={40}
                    value={v.telefon} onChange={set("telefon")} onBlur={touch("telefon")} className={cls("telefon")} />
                  <ErrorText>{shown("telefon")}</ErrorText>
                </div>
                <div>
                  <Label htmlFor="t-szuletes" required>
                    {copy.birth}
                  </Label>
                  <input id="t-szuletes" type="date"
                    value={v.szuletes} onChange={set("szuletes")} onBlur={touch("szuletes")} className={cls("szuletes")} />
                  <ErrorText>{shown("szuletes")}</ErrorText>
                </div>
              </div>

              <ChipGroup name="polo" label={copy.shirt} options={camp.form.shirtSizes} value={v.polo} onChange={setVal("polo")} />

              <div>
                <Label htmlFor="t-tudnivalo">{copy.importantNote}</Label>
                <textarea id="t-tudnivalo" rows={4} placeholder={copy.notePlaceholder} maxLength={2000}
                  value={v.tudnivalo} onChange={set("tudnivalo")} className={cls("tudnivalo", "resize-none")} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="t-szulo_nev">{copy.parent}</Label>
                  <input id="t-szulo_nev" type="text" placeholder={copy.parentPlaceholder} maxLength={200}
                    value={v.szulo_nev} onChange={set("szulo_nev")} className={cls("szulo_nev")} />
                </div>
                <div>
                  <Label htmlFor="t-szulo_telefon">{copy.parentPhone}</Label>
                  <input id="t-szulo_telefon" type="tel" placeholder="+36 30 123 4567" maxLength={40}
                    value={v.szulo_telefon} onChange={set("szulo_telefon")} className={cls("szulo_telefon")} />
                </div>
              </div>

              <div>
                <Label htmlFor="t-lakcim">{copy.address}</Label>
                <input id="t-lakcim" type="text" autoComplete="street-address" placeholder={copy.billingAddress} maxLength={300}
                  value={v.lakcim} onChange={set("lakcim")} className={cls("lakcim")} />
              </div>

              <ChipGroup name="fizetes" label={copy.payment} options={camp.form.payments} value={v.fizetes} onChange={setVal("fizetes")} />
              <ChipGroup name="honnan" label={copy.source} options={camp.form.sources} value={v.honnan} onChange={setVal("honnan")} />
              <ChipGroup name="kitolto" label={copy.filler} options={camp.form.fillers} value={v.kitolto} onChange={setVal("kitolto")} />

              <div className="space-y-4 rounded-3xl bg-gray-50 p-6">
                <div id="t-adatkezeles">
                  <CheckBox id="c-adatkezeles" checked={v.adatkezeles} error={submitTried && errors.adatkezeles}
                    onChange={(e) => setV((p) => ({ ...p, adatkezeles: e.target.checked }))}>
                    {copy.privacyRead}{" "}
                    <a href={locale === "en" ? "/en/privacy" : PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-md-deep">
                      {copy.privacyLink}
                    </a>{" "}
                    {copy.privacyEnd} <span className="text-[#1a9ea3]">*</span>
                  </CheckBox>
                  {submitTried && <ErrorText>{errors.adatkezeles}</ErrorText>}
                </div>
                <div id="t-hozzajarulas">
                  <CheckBox id="c-hozzajarulas" checked={v.hozzajarulas} error={submitTried && errors.hozzajarulas}
                    onChange={(e) => setV((p) => ({ ...p, hozzajarulas: e.target.checked }))}>
                    {copy.consentData} <span className="text-[#1a9ea3]">*</span>
                  </CheckBox>
                  {submitTried && <ErrorText>{errors.hozzajarulas}</ErrorText>}
                </div>
              </div>

              {submitTried && errorCount > 0 && (
                <ErrorBox>
                  {errorCount === 1
                    ? copy.genericError
                    : `${errorCount} ${copy.genericErrorMany}`}
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
                {sending ? copy.sending : copy.submit}
              </motion.button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="text-[#1a9ea3]">*</span> {copy.required}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
