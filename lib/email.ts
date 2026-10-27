import "server-only";

/*
  E-mail küldés a Resend API-n át (nincs külön SDK, sima fetch).
  Beállítás (környezeti változók):
    RESEND_API_KEY        — a Resend API kulcs
    RESEND_FROM_EMAIL     — hitelesített feladó, pl. "MD Dance School <info@mddanceschool.hu>"
  Ha a kulcs vagy a feladó hiányzik, az e-mail csendben kimarad (a naplóba
  kerül egy figyelmeztetés) — a jelentkezés ettől még mentődik.
*/

export type Email = {
  to: string | string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) {
    console.warn("[email] RESEND_API_KEY / RESEND_FROM_EMAIL nincs beállítva — az e-mail kimaradt:", email.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email.to,
        cc: email.cc?.length ? email.cc : undefined,
        reply_to: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend hiba:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] küldési hiba:", err);
    return false;
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Egyszerű, márkázott e-mail keret: cím + kulcs–érték sorok + opcionális gomb. */
export function renderEmail(opts: {
  title: string;
  intro?: string;
  rows: [string, string][];
  button?: { label: string; href: string };
  outro?: string;
}): { html: string; text: string } {
  const rowsHtml = opts.rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#94a3b8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 0;color:#0d0d0d;font-size:14px;font-weight:600">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f6;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
<div style="background:#ffffff;border-radius:24px;padding:32px">
<p style="margin:0 0 4px;color:#087c81;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">MD Dance School</p>
<h1 style="margin:0 0 16px;color:#0d0d0d;font-size:22px">${escapeHtml(opts.title)}</h1>
${opts.intro ? `<p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6">${escapeHtml(opts.intro)}</p>` : ""}
<table style="border-collapse:collapse;width:100%">${rowsHtml}</table>
${opts.button ? `<p style="margin:28px 0 0"><a href="${escapeHtml(opts.button.href)}" style="display:inline-block;background:#0d0d0d;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;letter-spacing:.15em;text-transform:uppercase;padding:14px 22px;border-radius:14px">${escapeHtml(opts.button.label)}</a></p>` : ""}
${opts.outro ? `<p style="margin:24px 0 0;color:#475569;font-size:13px;line-height:1.6">${escapeHtml(opts.outro)}</p>` : ""}
</div></div></body></html>`;
  const text = [
    opts.title,
    "",
    opts.intro ?? "",
    "",
    ...opts.rows.map(([k, v]) => `${k}: ${v}`),
    opts.button ? `\n${opts.button.label}: ${opts.button.href}` : "",
    opts.outro ? `\n${opts.outro}` : "",
  ]
    .join("\n")
    .trim();
  return { html, text };
}
