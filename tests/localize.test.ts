import assert from "node:assert/strict";
import test from "node:test";
import { alternateLocalePath } from "../lib/i18n.ts";
import { applyTranslationDraft, localize, missingTranslationCount, translationDraft, translationFields } from "../lib/localize.ts";

test("English translations fall back to Hungarian for empty fields", () => {
  assert.deepEqual(
    localize({ title: "Magyar cím", description: "Magyar leírás", en: { title: "English title", description: "" } }, "en"),
    { title: "English title", description: "Magyar leírás" },
  );
});

test("language switch maps the camp and news routes to their language pairs", () => {
  assert.equal(alternateLocalePath("/tanctabor", "hu"), "/en/camp");
  assert.equal(alternateLocalePath("/en/camp", "en"), "/tanctabor");
  assert.equal(alternateLocalePath("/hirek/workshop", "hu"), "/en/news/workshop");
  assert.equal(alternateLocalePath("/en/news/workshop", "en"), "/hirek/workshop");
});

test("translation editor only includes translatable content fields", () => {
  const value = {
    key: "internal-key",
    title: "Magyar cím",
    price: "20 000 Ft",
    emoji: "🎟",
    socials: [{ label: "Instagram", href: "https://instagram.com/example" }],
    items: [{ name: "Havi bérlet", note: "*" }],
    en: {},
  };

  assert.deepEqual(
    translationFields(value).map((field) => field.path),
    [["title"], ["items", 0, "name"]],
  );
  assert.equal(missingTranslationCount(value), 2);
});

test("translation draft preserves structure and only updates English content", () => {
  const value = {
    title: "Magyar cím",
    imagePath: "/hero.jpg",
    items: [{ name: "Első", price: "20 000 Ft" }],
    en: { title: "English title", items: [{ name: "" }] },
  };
  const draft = translationDraft(value);
  assert.deepEqual(draft, {
    title: "English title",
    imagePath: "/hero.jpg",
    items: [{ name: "", price: "20 000 Ft" }],
  });

  const updated = applyTranslationDraft(value, {
    ...draft,
    title: "Updated title",
    imagePath: "/ignored.jpg",
    items: [{ name: "First", price: "ignored" }],
  });
  assert.deepEqual(updated, {
    ...value,
    en: { title: "Updated title", items: [{ name: "First" }] },
  });
});
