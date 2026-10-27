import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import TextsEditor from "./TextsEditor";

export const metadata: Metadata = { title: "Hero · Rólunk · Szolgáltatások" };

async function Content() {
  await requireAdmin();
  const [hero, about, services, info] = await Promise.all([
    getSetting("hero"),
    getSetting("about"),
    getSetting("services"),
    getEditInfo("texts"),
  ]);
  return <TextsEditor initial={{ hero, about, services }} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
