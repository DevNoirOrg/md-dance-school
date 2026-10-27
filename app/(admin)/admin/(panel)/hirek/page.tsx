import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import NewsEditor from "./NewsEditor";

export const metadata: Metadata = { title: "Hírek" };

async function Content() {
  await requireAdmin();
  const [news, info] = await Promise.all([getSetting("news"), getEditInfo("news")]);
  return <NewsEditor initial={news} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
