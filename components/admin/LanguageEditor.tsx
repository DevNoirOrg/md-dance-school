"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { applyTranslationDraft, missingTranslationCount, translationDraft } from "@/lib/localize";
import { LanguageEditorContext, type EditingLocale } from "./LanguageEditorContext";

type EditorRender<T> = (value: T, onChange: (value: T) => void, locale: EditingLocale) => ReactNode;

export default function LanguageEditor<T extends object>({
  value,
  onChange,
  children,
}: {
  value: T;
  onChange: (value: T) => void;
  children: EditorRender<T>;
}) {
  const [locale, setLocale] = useState<EditingLocale>("hu");
  const missing = missingTranslationCount(value);
  const englishValue = useMemo(() => translationDraft(value), [value]);
  const displayedValue = locale === "hu" ? value : englishValue;
  const updateDisplayedValue = (next: T) => {
    onChange(locale === "hu" ? next : applyTranslationDraft(value, next));
  };
  const sourceRef = useRef<HTMLDivElement>(null);
  const displayedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (locale !== "en" || !sourceRef.current || !displayedRef.current) return;
    const sourceFields = Array.from(sourceRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input:not([type='hidden']), textarea"));
    const displayedFields = Array.from(displayedRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input:not([type='hidden']), textarea"));
    displayedFields.forEach((field, index) => {
      if (!field.value.trim() && sourceFields[index]?.value.trim()) {
        field.placeholder = sourceFields[index].value;
      }
    });
  }, [displayedValue, locale]);

  return (
    <LanguageEditorContext.Provider value={locale}>
      <div data-editing-locale={locale}>
        <div className="mb-5 flex items-center gap-1 border-b border-slate-200" role="tablist" aria-label="Szerkesztési nyelv">
          <button type="button" role="tab" aria-selected={locale === "hu"} onClick={() => setLocale("hu")}
            className={`border-b-2 px-4 py-3 text-sm font-extrabold transition-colors ${locale === "hu" ? "border-md-teal text-ink" : "border-transparent text-slate-400 hover:text-ink"}`}>
            Magyar
          </button>
          <button type="button" role="tab" aria-selected={locale === "en"} onClick={() => setLocale("en")}
            className={`border-b-2 px-4 py-3 text-sm font-extrabold transition-colors ${locale === "en" ? "border-md-teal text-ink" : "border-transparent text-slate-400 hover:text-ink"}`}>
            English <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${missing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{missing}</span>
          </button>
        </div>
        {locale === "en" && (
          <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Empty English fields fall back to the Hungarian text on the English site.
          </p>
        )}
        <div key={locale}>
          {locale === "en" && (
            <div ref={sourceRef} className="hidden" aria-hidden="true">
              <LanguageEditorContext.Provider value="hu">
                {children(value, () => undefined, "hu")}
              </LanguageEditorContext.Provider>
            </div>
          )}
          <div ref={displayedRef}>
            {children(displayedValue, updateDisplayedValue, locale)}
          </div>
        </div>
      </div>
    </LanguageEditorContext.Provider>
  );
}
