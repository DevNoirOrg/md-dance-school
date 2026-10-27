/** Egy sor a jelentkezés részletes nézetében. */
export default function DetailRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{k}</dt>
      <dd className="text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

export const mailLink = (email: string) => (
  <a className="text-md-teal underline" href={`mailto:${email}`}>
    {email}
  </a>
);

export const telLink = (phone: string) => (
  <a className="text-md-teal underline" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
    {phone}
  </a>
);
