import "server-only";
import sanitizeHtml from "sanitize-html";

/*
  A hírek szövegét az admin WYSIWYG szerkesztője (RichTextEditor, Tiptap)
  írja; mentéskor itt, szerveroldalon tisztítjuk meg a HTML-t (XSS ellen),
  és ebből derítjük ki, mely feltöltött képeket használja a szöveg (hogy a
  már nem hivatkozott képeket törölni lehessen a Storage-ból).
*/

const STORAGE_MARKER = "/storage/v1/object/public/mdschool/";

export function sanitizeNewsHtml(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        const out: Record<string, string> = { href };
        if (external) Object.assign(out, { target: "_blank", rel: "noopener noreferrer" });
        return { tagName, attribs: out };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  });
  return clean.replace(/^(\s*<p>\s*<\/p>\s*)+$/, "").trim();
}

export function bodyMediaPaths(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const i = m[1].indexOf(STORAGE_MARKER);
    if (i >= 0) out.push(decodeURIComponent(m[1].slice(i + STORAGE_MARKER.length)));
  }
  return out;
}
