import { Suspense, type ReactNode } from "react";
import PanelLoading from "./PanelLoading";

/** Admin szerkesztőoldal váza: a tartalom a munkamenet ellenőrzése után, Suspense-ben töltődik. */
export default function EditorPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PanelLoading />}>{children}</Suspense>;
}
