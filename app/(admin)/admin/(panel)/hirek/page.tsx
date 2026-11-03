import type { Metadata } from "next";
import EditorPage from "@/components/admin/EditorPage";
import { getEditInfo, getSetting } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { readNews } from "@/lib/content";
import NewsEditor from "./NewsEditor";

export const metadata: Metadata = { title: "Hírek" };

async function Content() {
  await requireAdmin();
  const [news, title, info] = await Promise.all([readNews(), getSetting("news"), getEditInfo("news")]);
  return <NewsEditor news={news} title={title.title} info={info} />;
}

export default function Page() {
  return (
    <EditorPage>
      <Content />
    </EditorPage>
  );
}
