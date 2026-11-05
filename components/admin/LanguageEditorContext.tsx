"use client";

import { createContext, useContext } from "react";

export type EditingLocale = "hu" | "en";

export const LanguageEditorContext = createContext<EditingLocale>("hu");

export function useEditingLocale() {
  return useContext(LanguageEditorContext);
}
