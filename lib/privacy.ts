/*
  Adatkezelési tájékoztató — a szöveg az adminban szerkeszthető (settings.privacy).
  Sima szöveg, három egyszerű szabállyal:
    - üres sor        → új bekezdés
    - "# Cím"         → fejezetcím (ebből készül a tartalomjegyzék is)
    - "- elem" sorok  → felsorolás
  Az első fejezetcím előtti szöveg kiemelt dobozban jelenik meg az oldal tetején.
*/

export const PRIVACY_URL = "/adatkezeles";

export type PrivacyBlock = { type: "p"; lines: string[] } | { type: "ul"; items: string[] };
export type PrivacySection = { id: string; title: string; blocks: PrivacyBlock[] };

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "fejezet"
  );
}

export function parsePrivacyText(text: string): { intro: PrivacyBlock[]; sections: PrivacySection[] } {
  const intro: PrivacyBlock[] = [];
  const sections: PrivacySection[] = [];
  const used = new Set<string>();
  const chunks = text.replace(/\r\n?/g, "\n").split(/\n\s*\n/);
  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    while (lines.length && lines[0].startsWith("#")) {
      const title = lines.shift()!.replace(/^#+\s*/, "");
      let id = slugify(title);
      let n = 2;
      while (used.has(id)) id = `${slugify(title)}-${n++}`;
      used.add(id);
      sections.push({ id, title, blocks: [] });
    }
    if (lines.length === 0) continue;
    const target = sections.length ? sections[sections.length - 1].blocks : intro;
    let para: string[] = [];
    let list: string[] = [];
    for (const line of lines) {
      if (/^[-–•]\s+/.test(line)) {
        if (para.length) {
          target.push({ type: "p", lines: para });
          para = [];
        }
        list.push(line.replace(/^[-–•]\s+/, ""));
      } else {
        if (list.length) {
          target.push({ type: "ul", items: list });
          list = [];
        }
        para.push(line);
      }
    }
    if (para.length) target.push({ type: "p", lines: para });
    if (list.length) target.push({ type: "ul", items: list });
  }
  return { intro, sections };
}
